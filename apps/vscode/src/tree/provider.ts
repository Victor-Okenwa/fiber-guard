import type { ChannelInfo, PeerInfo } from '@fiberguard/shared';
import { formatCkbFromShannons } from '@fiberguard/shared';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { truncateMiddle } from '../lib/format.js';
import { describeRpcError } from '../lib/rpc-error.js';

type NodeKind =
  | 'section-actions'
  | 'section-channels'
  | 'section-peers'
  | 'action'
  | 'channel'
  | 'peer'
  | 'message';

interface ActionDefinition {
  label: string;
  command: string;
  icon: string;
  tooltip: string;
}

const ACTIONS: ActionDefinition[] = [
  {
    label: 'Health Details',
    command: 'fiberguard.nodeStatus',
    icon: 'heart',
    tooltip:
      '**Health Details**\n\nFetch node version, pubkey, peer/channel counts, health score, diagnostics, and recommendations. Results appear in the FiberGuard output channel.',
  },
  {
    label: 'Can I Pay?',
    command: 'fiberguard.canIPay',
    icon: 'credit-card',
    tooltip:
      '**Can I Pay?**\n\nPaste a Fiber invoice to preview amount, success probability, and blockers before calling sendPayment.',
  },
  {
    label: 'Diagnose Payment',
    command: 'fiberguard.diagnosePayment',
    icon: 'search-fuzzy',
    tooltip:
      '**Diagnose Payment**\n\nEnter a payment hash to inspect status and structured failure diagnostics (never raw failedError alone).',
  },
  {
    label: 'View All Payments',
    command: 'fiberguard.viewPayments',
    icon: 'list-flat',
    tooltip:
      '**View All Payments**\n\nOpen a table of recent payments with hash, status, amount, fee, and last updated time.',
  },
];

export class FiberTreeItem extends vscode.TreeItem {
  constructor(
    readonly kind: NodeKind,
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}

export class FiberTreeProvider implements vscode.TreeDataProvider<FiberTreeItem> {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<FiberTreeItem | undefined>();
  readonly onDidChangeTreeData = this.onDidChangeEmitter.event;

  private channels: ChannelInfo[] = [];
  private peers: PeerInfo[] = [];
  private loadError: string | null = null;

  refresh(): void {
    this.onDidChangeEmitter.fire(undefined);
  }

  getTreeItem(element: FiberTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: FiberTreeItem): Promise<FiberTreeItem[]> {
    if (!element) {
      await this.load();
      if (this.loadError) {
        const item = new FiberTreeItem(
          'message',
          this.loadError,
          vscode.TreeItemCollapsibleState.None,
        );
        item.iconPath = new vscode.ThemeIcon('error');
        return [item];
      }
      return [
        this.sectionItem('section-actions', 'Actions'),
        this.sectionItem('section-channels', `Channels (${this.channels.length})`),
        this.sectionItem('section-peers', `Peers (${this.peers.length})`),
      ];
    }

    if (element.kind === 'section-actions') return this.actionItems();
    if (element.kind === 'section-channels') return this.channelItems();
    if (element.kind === 'section-peers') return this.peerItems();
    return [];
  }

  private async load(): Promise<void> {
    try {
      const client = getFiberClient();
      const [channels, peers] = await Promise.all([client.listChannels(), client.listPeers()]);
      this.channels = channels;
      this.peers = peers;
      this.loadError = null;
    } catch (error) {
      this.channels = [];
      this.peers = [];
      this.loadError = describeRpcError(error).message;
    }
  }

  private sectionItem(kind: NodeKind, label: string): FiberTreeItem {
    const item = new FiberTreeItem(kind, label, vscode.TreeItemCollapsibleState.Expanded);
    const icons: Partial<Record<NodeKind, string>> = {
      'section-actions': 'run-all',
      'section-channels': 'git-compare',
      'section-peers': 'organization',
    };
    item.iconPath = new vscode.ThemeIcon(icons[kind] ?? 'folder');
    return item;
  }

  private actionItems(): FiberTreeItem[] {
    return ACTIONS.map((action) => this.actionItem(action));
  }

  private actionItem(action: ActionDefinition): FiberTreeItem {
    const item = new FiberTreeItem('action', action.label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon(action.icon);
    item.command = { command: action.command, title: action.label };
    const tooltip = new vscode.MarkdownString(action.tooltip);
    tooltip.isTrusted = true;
    item.tooltip = tooltip;
    return item;
  }

  private channelItems(): FiberTreeItem[] {
    if (this.channels.length === 0) {
      return [
        this.messageItem(
          'No channels open. See docs/demo-setup.md to open a ChannelReady channel.',
        ),
      ];
    }
    return this.channels.map((channel) => {
      const ready = channel.stateName === 'ChannelReady';
      const item = new FiberTreeItem(
        'channel',
        truncateMiddle(channel.channelId),
        vscode.TreeItemCollapsibleState.None,
      );
      item.description = `${channel.stateName} · local ${formatCkbFromShannons(channel.localBalance)} / cap ${formatCkbFromShannons(channel.capacity)}`;
      item.iconPath = new vscode.ThemeIcon(
        ready ? 'pass' : 'warning',
        ready ? undefined : new vscode.ThemeColor('list.warningForeground'),
      );
      item.tooltip = [
        `Channel ${channel.channelId}`,
        `State: ${channel.stateName}${channel.enabled ? '' : ' (disabled)'}`,
        `Local: ${formatCkbFromShannons(channel.localBalance)}`,
        `Remote: ${formatCkbFromShannons(channel.remoteBalance)}`,
        `Capacity: ${formatCkbFromShannons(channel.capacity)}`,
      ].join('\n');
      return item;
    });
  }

  private peerItems(): FiberTreeItem[] {
    if (this.peers.length === 0) {
      return [
        this.messageItem(
          'No peers connected. Use connect_peer to add public testnet nodes — see docs/demo-setup.md.',
        ),
      ];
    }
    return this.peers.map((peer) => {
      const item = new FiberTreeItem(
        'peer',
        truncateMiddle(peer.pubkey, 8, 6),
        vscode.TreeItemCollapsibleState.None,
      );
      item.description = peer.address;
      item.iconPath = new vscode.ThemeIcon('vm-connect');
      const tooltip = new vscode.MarkdownString(
        [
          '**Peer connection**',
          '',
          `**Public key:** \`${peer.pubkey}\``,
          '',
          `**Address:** \`${peer.address}\``,
          '',
          '**Status:** Connected',
        ].join('\n'),
      );
      tooltip.isTrusted = true;
      item.tooltip = tooltip;
      return item;
    });
  }

  private messageItem(text: string): FiberTreeItem {
    const item = new FiberTreeItem('message', text, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('info');
    return item;
  }
}
