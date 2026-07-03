import type { DiagnosticSeverity } from '../types/diagnostic.js';
import type { HealthStatus } from '../types/domain.js';

export const DIAGNOSTIC_CODES = {
  NODE_UNREACHABLE: 'NODE_UNREACHABLE',
  NO_PEERS: 'NO_PEERS',
  NO_CHANNELS: 'NO_CHANNELS',
  CHANNEL_NOT_READY: 'CHANNEL_NOT_READY',
  CHANNEL_DISABLED: 'CHANNEL_DISABLED',
  LOW_OUTBOUND_LIQUIDITY: 'LOW_OUTBOUND_LIQUIDITY',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  INSUFFICIENT_LIQUIDITY: 'INSUFFICIENT_LIQUIDITY',
  PEER_UNREACHABLE: 'PEER_UNREACHABLE',
  INVOICE_PARSE_ERROR: 'INVOICE_PARSE_ERROR',
  CANNOT_PAY: 'CANNOT_PAY',
} as const;

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES];

const SEVERITY_RANK: Record<DiagnosticSeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
};

export function maxSeverity(a: DiagnosticSeverity, b: DiagnosticSeverity): DiagnosticSeverity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

export function healthStatusFromScore(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'degraded';
  return 'critical';
}
