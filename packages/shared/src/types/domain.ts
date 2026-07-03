import type { Diagnostic } from './diagnostic.js';

export type HealthStatus = 'healthy' | 'degraded' | 'critical';

export interface NodeHealth {
  score: number;
  status: HealthStatus;
  diagnostics: Diagnostic[];
}

export interface ChannelInfo {
  channelId: string;
  pubkey: string;
  stateName: string;
  localBalance: bigint;
  remoteBalance: bigint;
  capacity: bigint;
  isPublic: boolean;
  enabled: boolean;
}

export interface PeerInfo {
  pubkey: string;
  address: string;
}

export type PaymentStatus = 'Created' | 'Inflight' | 'Success' | 'Failed';

export interface PaymentInfo {
  paymentHash: string;
  status: PaymentStatus;
  fee: bigint;
  failedError?: string;
  createdAt?: bigint;
  lastUpdatedAt?: bigint;
}

export interface ParsedInvoice {
  invoice: string;
  amount?: bigint;
  currency?: string;
  description?: string;
  paymentHash?: string;
}
