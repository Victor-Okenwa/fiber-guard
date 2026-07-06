import { diagnosePaymentFailure } from '@fiberguard/diagnostics';
import type { Diagnostic } from '@fiberguard/shared';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { formatDiagnostics, formatPaymentSummary } from '../lib/format.js';
import { fetchNodeSnapshot } from '../lib/node-snapshot.js';
import { logLines, logSection } from '../lib/output.js';
import { withRpcProgress } from '../lib/progress.js';
import { reportError } from './report-error.js';

export async function diagnosePaymentCommand(channel: vscode.OutputChannel): Promise<void> {
  const hash = await vscode.window.showInputBox({
    prompt: 'Payment hash to diagnose',
    placeHolder: '0x…',
    ignoreFocusOut: true,
  });
  if (!hash?.trim()) return;

  try {
    const result = await withRpcProgress('FiberGuard: diagnosing payment…', async () => {
      const client = getFiberClient();
      const payment = await client.getPayment(hash.trim());
      let diagnostics: Diagnostic[] = [];
      if (payment.status === 'Failed') {
        const { channels, peers } = await fetchNodeSnapshot(client);
        diagnostics = diagnosePaymentFailure(payment, channels, peers);
      }
      return { payment, diagnostics };
    });
    if (!result) return;

    const { payment, diagnostics } = result;

    logSection(channel, 'Payment Diagnosis');
    logLines(channel, formatPaymentSummary(payment));

    if (payment.status === 'Failed') {
      logSection(channel, 'Why it failed');
      logLines(
        channel,
        formatDiagnostics(
          diagnostics,
          'Payment failed but no structured diagnostic was available. Check node logs for details.',
        ),
      );
    } else {
      logLines(
        channel,
        payment.status === 'Success'
          ? '\nPayment completed successfully.'
          : `\nPayment is ${payment.status.toLowerCase()}.`,
      );
    }

    channel.show(true);
  } catch (error) {
    reportError(channel, error);
  }
}
