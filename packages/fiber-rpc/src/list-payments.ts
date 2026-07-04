import type { PaymentResult } from '@ckb-ccc/fiber';
import type { PaymentInfo, PaymentStatus } from '@fiberguard/shared';

export interface ListPaymentsParams {
  status?: PaymentStatus;
  limit?: number;
  after?: string;
}

export interface ListPaymentsResult {
  payments: PaymentInfo[];
  lastCursor?: string;
}

/** Raw Fiber RPC `list_payments` response shape. */
export interface FiberListPaymentsResponse {
  payments: PaymentResult[];
  last_cursor?: string;
}
