import type { PaymentInfo } from '@fiberguard/shared';
import { formatCkbFromShannons } from '@fiberguard/shared';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { formatPaymentAmount, formatPaymentTimestamp, truncateMiddle } from '../lib/format.js';
import { withRpcProgress } from '../lib/progress.js';
import { reportError } from './report-error.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderPaymentsTable(payments: PaymentInfo[]): string {
  const rows = payments
    .map((payment) => {
      const hash = escapeHtml(payment.paymentHash);
      const statusLabel = escapeHtml(payment.status);
      const statusClass = payment.status.toLowerCase();
      const amount = escapeHtml(formatPaymentAmount(payment.amount));
      const fee = escapeHtml(formatCkbFromShannons(payment.fee));
      const updated = escapeHtml(formatPaymentTimestamp(payment.lastUpdatedAt));
      return `<tr>
        <td class="mono" title="${hash}">${escapeHtml(truncateMiddle(payment.paymentHash, 12, 6))}</td>
        <td><span class="status status-${statusClass}">${statusLabel}</span></td>
        <td class="mono num">${amount}</td>
        <td class="mono num">${fee}</td>
        <td class="muted">${updated}</td>
      </tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 12px 16px;
    }
    h1 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    th {
      color: var(--vscode-descriptionForeground);
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    tr:hover td {
      background: var(--vscode-list-hoverBackground);
    }
    .mono { font-family: var(--vscode-editor-font-family); }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .muted { color: var(--vscode-descriptionForeground); white-space: nowrap; }
    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .status-success { background: color-mix(in srgb, var(--vscode-charts-green) 20%, transparent); }
    .status-failed { background: color-mix(in srgb, var(--vscode-errorForeground) 15%, transparent); color: var(--vscode-errorForeground); }
    .status-inflight, .status-created { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
    .hint { margin-top: 12px; color: var(--vscode-descriptionForeground); font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Recent payments (${payments.length})</h1>
  <table>
    <thead>
      <tr>
        <th>Hash</th>
        <th>Status</th>
        <th class="num">Amount</th>
        <th class="num">Fee</th>
        <th>Updated</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <p class="hint">Use <strong>FiberGuard: Diagnose Payment</strong> with a payment hash for failure diagnostics.</p>
</body>
</html>`;
}

export async function viewPaymentsCommand(channel: vscode.OutputChannel): Promise<void> {
  try {
    const result = await withRpcProgress('FiberGuard: loading payments…', async () => {
      const client = getFiberClient();
      return client.listPayments({ limit: 20 });
    });
    if (!result) return;

    if (result.payments.length === 0) {
      void vscode.window.showInformationMessage(
        'No payments yet. Send a test payment from your Fiber node to populate history.',
      );
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'fiberguardPayments',
      'FiberGuard Payments',
      vscode.ViewColumn.Active,
      { enableScripts: false, retainContextWhenHidden: true },
    );
    panel.webview.html = renderPaymentsTable(result.payments);
  } catch (error) {
    reportError(channel, error);
  }
}
