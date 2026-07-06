import type { Diagnostic } from '@fiberguard/shared';
import { describe, expect, it } from 'vitest';
import {
  formatDiagnostic,
  formatDiagnostics,
  formatInvoicePreview,
  formatPaymentAmount,
  formatPaymentTimestamp,
  probabilityVerdict,
  truncateMiddle,
} from './format.js';

const diagnostic: Diagnostic = {
  code: 'NO_PEERS',
  severity: 'warning',
  title: 'No connected peers',
  explanation: 'Your node is not connected to any peers.',
  remediation: 'Connect to public testnet nodes using connect_peer.',
};

describe('formatDiagnostic', () => {
  it('includes severity, title, explanation, and remediation', () => {
    const text = formatDiagnostic(diagnostic);
    expect(text).toContain('[WARN] No connected peers');
    expect(text).toContain('Your node is not connected to any peers.');
    expect(text).toContain('Fix: Connect to public testnet nodes using connect_peer.');
  });

  it('omits the fix line when remediation is missing', () => {
    const text = formatDiagnostic({ ...diagnostic, remediation: undefined });
    expect(text).not.toContain('Fix:');
  });
});

describe('formatDiagnostics', () => {
  it('returns the empty message for an empty list', () => {
    expect(formatDiagnostics([], 'No issues detected.')).toBe('No issues detected.');
  });

  it('joins multiple diagnostics', () => {
    const text = formatDiagnostics([diagnostic, diagnostic], 'empty');
    expect(text.match(/\[WARN\]/g)).toHaveLength(2);
  });
});

describe('formatInvoicePreview', () => {
  it('formats amount as CKB', () => {
    const text = formatInvoicePreview({
      invoice: 'fibt1...',
      amount: 10_000_000_000n,
      currency: 'Fibt',
      description: 'test invoice',
    });
    expect(text).toContain('Amount: 100 CKB');
    expect(text).toContain('Currency: Fibt');
    expect(text).toContain('Description: test invoice');
  });
});

describe('probabilityVerdict', () => {
  it('matches web thresholds', () => {
    expect(probabilityVerdict(85)).toContain('Likely to succeed');
    expect(probabilityVerdict(50)).toContain('May fail');
    expect(probabilityVerdict(10)).toContain('Unlikely to succeed');
  });
});

describe('formatPaymentAmount', () => {
  it('formats CKB amount or em dash when missing', () => {
    expect(formatPaymentAmount(10_000_000_000n)).toBe('100 CKB');
    expect(formatPaymentAmount(undefined)).toBe('—');
  });
});

describe('formatPaymentTimestamp', () => {
  it('returns em dash for missing timestamp', () => {
    expect(formatPaymentTimestamp(undefined)).toBe('—');
  });
});
describe('truncateMiddle', () => {
  it('truncates long values and keeps short ones', () => {
    expect(truncateMiddle('0xabcdef0123456789abcdef')).toBe('0xabcdef01…cdef');
    expect(truncateMiddle('0xshort')).toBe('0xshort');
  });
});
