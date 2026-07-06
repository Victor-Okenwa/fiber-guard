import * as vscode from 'vscode';
import { canIPayCommand } from './commands/can-i-pay.js';
import { diagnosePaymentCommand } from './commands/diagnose-payment.js';
import { nodeStatusCommand } from './commands/node-status.js';
import { viewPaymentsCommand } from './commands/view-payments.js';
import { copyToClipboard } from './lib/copy.js';
import { type FiberTreeItem, FiberTreeProvider } from './tree/provider.js';

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel('FiberGuard');
  const treeProvider = new FiberTreeProvider();

  context.subscriptions.push(
    outputChannel,
    vscode.window.registerTreeDataProvider('fiberguard.explorer', treeProvider),
    vscode.commands.registerCommand('fiberguard.refresh', () => treeProvider.refresh()),
    vscode.commands.registerCommand(
      'fiberguard.treePaginate',
      (section: 'channels' | 'peers', delta: number) => {
        treeProvider.paginate(section, delta);
      },
    ),
    vscode.commands.registerCommand('fiberguard.nodeStatus', () =>
      nodeStatusCommand(outputChannel),
    ),
    vscode.commands.registerCommand('fiberguard.canIPay', () => canIPayCommand(outputChannel)),
    vscode.commands.registerCommand('fiberguard.diagnosePayment', () =>
      diagnosePaymentCommand(outputChannel),
    ),
    vscode.commands.registerCommand('fiberguard.viewPayments', () =>
      viewPaymentsCommand(outputChannel),
    ),
    vscode.commands.registerCommand('fiberguard.copyValue', (item: FiberTreeItem) => {
      if (item?.copyValue) void copyToClipboard(item.copyValue, 'Value');
    }),
    vscode.commands.registerCommand('fiberguard.copyPeerAddress', (item: FiberTreeItem) => {
      if (item?.secondaryCopyValue) void copyToClipboard(item.secondaryCopyValue, 'Address');
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('fiberguard.nodeUrl')) {
        treeProvider.refresh();
      }
    }),
  );
}

export function deactivate(): void {
  // Disposables are cleaned up via context.subscriptions.
}
