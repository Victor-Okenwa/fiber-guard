import type { Diagnostic, ParsedInvoice, PaymentInfo } from '@fiberguard/shared';
import { formatCkbFromShannons } from '@fiberguard/shared';

const SEVERITY_LABELS: Record<Diagnostic['severity'], string> = {
  info: 'INFO',
  warning: 'WARN',
  error: 'ERROR',
};

export function formatDiagnostic(diagnostic: Diagnostic): string {
  const lines = [
    `[${SEVERITY_LABELS[diagnostic.severity]}] ${diagnostic.title}`,
    `  ${diagnostic.explanation}`,
  ];
  if (diagnostic.remediation) {
    lines.push(`  Fix: ${diagnostic.remediation}`);
  }
  return lines.join('\n');
}

export function formatDiagnostics(diagnostics: Diagnostic[], emptyMessage: string): string {
  if (diagnostics.length === 0) return emptyMessage;
  return diagnostics.map(formatDiagnostic).join('\n\n');
}

export function formatInvoicePreview(invoice: ParsedInvoice): string {
  const lines: string[] = [];
  if (invoice.amount !== undefined) {
    lines.push(`Amount: ${formatCkbFromShannons(invoice.amount)}`);
  }
  if (invoice.currency) lines.push(`Currency: ${invoice.currency}`);
  if (invoice.description) lines.push(`Description: ${invoice.description}`);
  if (invoice.paymentHash) lines.push(`Payment hash: ${invoice.paymentHash}`);
  return lines.length > 0 ? lines.join('\n') : 'No invoice details available.';
}

export function formatPaymentSummary(payment: PaymentInfo): string {
  return [
    `Payment: ${payment.paymentHash}`,
    `Status: ${payment.status}`,
    `Amount: ${formatPaymentAmount(payment.amount)}`,
    `Fee: ${formatCkbFromShannons(payment.fee)}`,
  ].join('\n');
}

export function formatPaymentAmount(amount: bigint | undefined): string {
  if (amount === undefined || amount === 0n) return '—';
  return formatCkbFromShannons(amount);
}

export function formatPaymentTimestamp(value: bigint | undefined): string {
  if (value === undefined || value === 0n) return '—';
  const ms = value < 1_000_000_000_000n ? Number(value) * 1000 : Number(value);
  return new Date(ms).toLocaleString();
}

/** Same thresholds and CTA copy as the web can-i-pay view. */
export function probabilityVerdict(probability: number): string {
  if (probability >= 70) return 'Likely to succeed — you can try sendPayment.';
  if (probability >= 40) return 'May fail — fix warnings before sending.';
  return 'Unlikely to succeed — resolve blockers before sendPayment.';
}

export function truncateMiddle(value: string, head = 10, tail = 4): string {
  return value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}
