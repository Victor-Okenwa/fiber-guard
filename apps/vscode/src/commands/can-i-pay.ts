import { canIPay } from '@fiberguard/diagnostics';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { formatDiagnostics, formatInvoicePreview, probabilityVerdict } from '../lib/format.js';
import { fetchNodeSnapshot } from '../lib/node-snapshot.js';
import { logLines, logSection } from '../lib/output.js';
import { withRpcProgress } from '../lib/progress.js';
import { reportError } from './report-error.js';

export async function canIPayCommand(channel: vscode.OutputChannel): Promise<void> {
  const invoice = await vscode.window.showInputBox({
    prompt: 'Paste a Fiber invoice to check payment success probability',
    placeHolder: 'fibt…',
    ignoreFocusOut: true,
  });
  if (!invoice?.trim()) return;

  try {
    const result = await withRpcProgress('FiberGuard: checking invoice…', async () => {
      const client = getFiberClient();
      const parsed = await client.parseInvoice(invoice.trim());
      const { node, channels, peers } = await fetchNodeSnapshot(client);
      return { parsed, verdict: canIPay(parsed, channels, peers, node) };
    });
    if (!result) return;

    const { parsed, verdict } = result;

    logSection(channel, 'Can I Pay?');
    logLines(channel, formatInvoicePreview(parsed));
    logLines(
      channel,
      `\nSuccess probability: ${verdict.probability}%\n${probabilityVerdict(verdict.probability)}`,
    );

    logSection(channel, 'Blockers');
    logLines(channel, formatDiagnostics(verdict.blockers, 'No blockers — routing looks healthy.'));

    channel.show(true);
    void vscode.window.showInformationMessage(
      `Can I Pay? ${verdict.probability}% — ${probabilityVerdict(verdict.probability)}`,
    );
  } catch (error) {
    reportError(channel, error);
  }
}
