import { assessNodeHealth, getRecommendations } from '@fiberguard/diagnostics';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { formatDiagnostics } from '../lib/format.js';
import { fetchNodeSnapshot } from '../lib/node-snapshot.js';
import { logLines, logSection } from '../lib/output.js';
import { withRpcProgress } from '../lib/progress.js';
import { reportError } from './report-error.js';

export async function nodeStatusCommand(channel: vscode.OutputChannel): Promise<void> {
  try {
    const snapshot = await withRpcProgress('FiberGuard: fetching node status…', () =>
      fetchNodeSnapshot(getFiberClient()),
    );
    if (!snapshot) return;

    const { node, channels, peers } = snapshot;
    const health = assessNodeHealth(node, channels, peers);
    const recommendations = getRecommendations(health, channels, peers);

    logSection(channel, 'Node Status');
    logLines(
      channel,
      [
        `Endpoint: ${getFiberClient().endpoint}`,
        `Version: ${node.version}`,
        `Pubkey: ${node.pubkey}`,
        `Peers: ${node.peerCount} · Channels: ${node.channelCount} (pending: ${node.pendingChannelCount})`,
        `Health: ${health.status} (${health.score}/100)`,
      ].join('\n'),
    );

    logSection(channel, 'Diagnostics');
    logLines(channel, formatDiagnostics(health.diagnostics, 'No issues detected.'));

    logSection(channel, 'Recommendations');
    logLines(channel, formatDiagnostics(recommendations, 'No recommendations right now.'));

    channel.show(true);
    void vscode.window.showInformationMessage(
      `Node health: ${health.status} (${health.score}/100)`,
    );
  } catch (error) {
    reportError(channel, error);
  }
}
