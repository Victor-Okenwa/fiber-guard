export const PACKAGE_NAME = '@fiberguard/shared' as const;

export {
  DIAGNOSTIC_CODES,
  type DiagnosticCode,
  healthStatusFromScore,
  maxSeverity,
} from './constants/severity.js';
export {
  channelCapacity,
  formatCkbFromShannons,
  formatShannons,
  parseHexAmount,
} from './formatters/amount.js';
export type { Diagnostic, DiagnosticSeverity } from './types/diagnostic.js';
export type {
  ChannelInfo,
  HealthStatus,
  NodeHealth,
  ParsedInvoice,
  PaymentInfo,
  PaymentStatus,
  PeerInfo,
} from './types/domain.js';
