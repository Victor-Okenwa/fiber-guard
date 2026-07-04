import type { CanIPayResult } from '@fiberguard/diagnostics';
import type { FiberNodeSummary } from '@fiberguard/fiber-rpc';
import type {
  ChannelInfo,
  Diagnostic,
  NodeHealth,
  ParsedInvoice,
  PaymentInfo,
  PeerInfo,
} from '@fiberguard/shared';

export interface ApiErrorBody {
  error: string;
  method?: string;
  remediation?: string;
}

export interface HealthResponse {
  node: FiberNodeSummary;
  channels: ChannelInfo[];
  peers: PeerInfo[];
  health: NodeHealth;
  recommendations: Diagnostic[];
}

export interface PaymentsListResponse {
  payments: PaymentInfo[];
  lastCursor?: string;
}

export interface PaymentDetailResponse {
  payment: PaymentInfo;
  diagnostics: Diagnostic[];
}

export interface CanIPayResponse extends CanIPayResult {
  invoice: ParsedInvoice;
}

export interface ExplainResponse {
  explanation: string;
  source: 'groq' | 'static';
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiErrorBody;
  if (!response.ok) {
    const err = data as ApiErrorBody;
    throw Object.assign(new Error(err.error ?? 'Request failed'), {
      status: response.status,
      remediation: err.remediation,
    });
  }
  return data as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health', { cache: 'no-store' });
  return parseJson<HealthResponse>(res);
}

export async function fetchChannels(): Promise<ChannelInfo[]> {
  const res = await fetch('/api/channels', { cache: 'no-store' });
  return parseJson<ChannelInfo[]>(res);
}

export async function fetchPeers(): Promise<PeerInfo[]> {
  const res = await fetch('/api/peers', { cache: 'no-store' });
  return parseJson<PeerInfo[]>(res);
}

export async function fetchPayments(): Promise<PaymentsListResponse> {
  const res = await fetch('/api/payments', { cache: 'no-store' });
  return parseJson<PaymentsListResponse>(res);
}

export async function fetchPaymentDetail(hash: string): Promise<PaymentDetailResponse> {
  const res = await fetch(`/api/payments/${encodeURIComponent(hash)}`, { cache: 'no-store' });
  return parseJson<PaymentDetailResponse>(res);
}

export async function fetchCanIPay(invoice: string): Promise<CanIPayResponse> {
  const res = await fetch('/api/can-i-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice }),
  });
  return parseJson<CanIPayResponse>(res);
}

export async function fetchExplain(
  diagnostic: Diagnostic,
  context?: Record<string, unknown>,
): Promise<ExplainResponse> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagnostic, context }),
  });
  return parseJson<ExplainResponse>(res);
}
