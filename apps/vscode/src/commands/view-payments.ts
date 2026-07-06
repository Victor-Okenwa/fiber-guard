import type { PaymentInfo } from '@fiberguard/shared';
import { formatCkbFromShannons } from '@fiberguard/shared';
import * as vscode from 'vscode';
import { getFiberClient } from '../lib/fiber-client.js';
import { formatPaymentAmount, formatPaymentTimestamp, truncateMiddle } from '../lib/format.js';
import { PAYMENTS_PAGE_SIZE } from '../lib/pagination.js';
import { withRpcProgress } from '../lib/progress.js';
import { reportError } from './report-error.js';

interface PaymentsPageState {
  payments: PaymentInfo[];
  pageIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
  rangeLabel: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderCopyButton(value: string, label: string): string {
  return `<button type="button" class="copy-btn" title="Copy ${escapeHtml(label)}" aria-label="Copy ${escapeHtml(label)}" data-copy="${escapeHtml(value)}">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2h8a1 1 0 0 1 1 1v8h-1V3H4V2zm-1 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 1v8h7V5H3z"/>
    </svg>
  </button>`;
}

function renderPaymentsTable(state: PaymentsPageState): string {
  const rows = state.payments
    .map((payment) => {
      const hash = payment.paymentHash;
      const hashEscaped = escapeHtml(hash);
      const statusLabel = escapeHtml(payment.status);
      const statusClass = payment.status.toLowerCase();
      const amount = escapeHtml(formatPaymentAmount(payment.amount));
      const fee = escapeHtml(formatCkbFromShannons(payment.fee));
      const updated = escapeHtml(formatPaymentTimestamp(payment.lastUpdatedAt));
      return `<tr>
        <td class="mono hash-cell">
          <span class="hash-text" title="${hashEscaped}">${escapeHtml(truncateMiddle(hash, 12, 6))}</span>
          ${renderCopyButton(hash, 'payment hash')}
        </td>
        <td><span class="status status-${statusClass}">${statusLabel}</span></td>
        <td class="mono num">${amount}</td>
        <td class="mono num">${fee}</td>
        <td class="muted">${updated}</td>
      </tr>`;
    })
    .join('\n');

  const prevDisabled = state.hasPrevious ? '' : ' disabled';
  const nextDisabled = state.hasNext ? '' : ' disabled';

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
    .hash-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .hash-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .copy-btn {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
    }
    .copy-btn:hover {
      background: var(--vscode-toolbar-hoverBackground);
      color: var(--vscode-foreground);
    }
    .copy-btn.copied { color: var(--vscode-charts-green); }
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
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .pagination-label {
      color: var(--vscode-descriptionForeground);
      font-size: 0.85rem;
    }
    .pagination-actions {
      display: flex;
      gap: 8px;
    }
    .page-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid var(--vscode-button-border, var(--vscode-panel-border));
      border-radius: 4px;
      background: var(--vscode-button-secondaryBackground, var(--vscode-editor-background));
      color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
      font: inherit;
      cursor: pointer;
    }
    .page-btn:hover:not(:disabled) {
      background: var(--vscode-button-secondaryHoverBackground, var(--vscode-list-hoverBackground));
    }
    .page-btn:disabled {
      opacity: 0.45;
      cursor: default;
    }
    #toast {
      position: fixed;
      bottom: 16px;
      right: 16px;
      padding: 8px 12px;
      border-radius: 6px;
      background: var(--vscode-notifications-background);
      color: var(--vscode-notifications-foreground);
      border: 1px solid var(--vscode-panel-border);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }
    #toast.visible { opacity: 1; }
  </style>
</head>
<body>
  <h1>Recent payments</h1>
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
  <div class="pagination">
    <span class="pagination-label">${escapeHtml(state.rangeLabel)}</span>
    <div class="pagination-actions">
      <button type="button" class="page-btn" id="prev-page"${prevDisabled}>Previous</button>
      <button type="button" class="page-btn" id="next-page"${nextDisabled}>Next</button>
    </div>
  </div>
  <p class="hint">Use <strong>FiberGuard: Diagnose Payment</strong> with a payment hash for failure diagnostics.</p>
  <div id="toast" role="status" aria-live="polite"></div>
  <script>
    const vscodeApi = acquireVsCodeApi();
    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('visible'), 1500);
    }

    document.querySelectorAll('.copy-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.getAttribute('data-copy');
        if (!value) return;
        vscodeApi.postMessage({ type: 'copy', value });
        button.classList.add('copied');
        setTimeout(() => button.classList.remove('copied'), 1500);
        showToast('Copied to clipboard');
      });
    });

    document.getElementById('prev-page')?.addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'page', direction: 'previous' });
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'page', direction: 'next' });
    });
  </script>
</body>
</html>`;
}

async function loadPaymentsPage(pageIndex: number, cursors: (string | undefined)[]) {
  const client = getFiberClient();
  const after = cursors[pageIndex];
  const result = await client.listPayments({ limit: PAYMENTS_PAGE_SIZE, after });
  const hasNext = Boolean(result.lastCursor && result.payments.length >= PAYMENTS_PAGE_SIZE);

  if (result.lastCursor) {
    if (cursors.length === pageIndex + 1) {
      cursors.push(result.lastCursor);
    } else if (cursors.length > pageIndex + 1) {
      cursors[pageIndex + 1] = result.lastCursor;
      cursors.length = pageIndex + 1;
    }
  } else if (cursors.length > pageIndex + 1) {
    cursors.length = pageIndex + 1;
  }

  const rangeLabel =
    result.payments.length === 0
      ? '0 items'
      : `Page ${pageIndex + 1}${hasNext ? '+' : ''} · ${result.payments.length} item${result.payments.length === 1 ? '' : 's'}`;

  return {
    payments: result.payments,
    pageIndex,
    hasPrevious: pageIndex > 0,
    hasNext,
    rangeLabel,
  } satisfies PaymentsPageState;
}

export async function viewPaymentsCommand(channel: vscode.OutputChannel): Promise<void> {
  try {
    const firstPage = await withRpcProgress('FiberGuard: loading payments…', async () =>
      loadPaymentsPage(0, [undefined]),
    );
    if (!firstPage) return;

    if (firstPage.payments.length === 0) {
      void vscode.window.showInformationMessage(
        'No payments yet. Send a test payment from your Fiber node to populate history.',
      );
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'fiberguardPayments',
      'FiberGuard Payments',
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );

    const cursors: (string | undefined)[] = [undefined];
    let pageIndex = 0;
    let loading = false;

    const render = (state: PaymentsPageState) => {
      panel.webview.html = renderPaymentsTable(state);
    };

    render(firstPage);

    panel.webview.onDidReceiveMessage(
      async (message: { type?: string; value?: string; direction?: string }) => {
        if (message.type === 'copy' && message.value) {
          void vscode.env.clipboard.writeText(message.value);
          return;
        }

        if (message.type !== 'page' || loading) return;

        if (message.direction === 'next') {
          if (pageIndex + 1 >= cursors.length) return;
          pageIndex += 1;
        } else if (message.direction === 'previous') {
          if (pageIndex === 0) return;
          pageIndex -= 1;
        } else {
          return;
        }

        loading = true;
        try {
          const state = await loadPaymentsPage(pageIndex, cursors);
          if (state.payments.length === 0 && pageIndex > 0) {
            pageIndex -= 1;
            return;
          }
          render(state);
        } catch (error) {
          reportError(channel, error);
        } finally {
          loading = false;
        }
      },
    );
  } catch (error) {
    reportError(channel, error);
  }
}
