'use client';

import { formatCkbFromShannons, parseHexAmount } from '@fiberguard/shared';
import { useState } from 'react';
import { StaleIndicator } from '@/components/data/stale-indicator';
import { TableSkeleton } from '@/components/data/table-skeleton';
import { DiagnosticList } from '@/components/diagnostics/diagnostic-list';
import { NodeUnreachableAlert } from '@/components/node/node-unreachable-alert';
import { PaymentStatusBadge } from '@/components/payments/payment-status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePoll } from '@/hooks/use-poll';
import type { PaymentDetailResponse } from '@/lib/api-client';
import { fetchPaymentDetail, fetchPayments } from '@/lib/api-client';

const POLL_MS = 30_000;

function truncateHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 10)}…${hash.slice(-4)}` : hash;
}

function formatPaymentAmount(amount: bigint | undefined): string {
  if (amount === undefined || amount === 0n) return '—';
  return formatCkbFromShannons(amount);
}

function formatTimestamp(value: string | bigint | undefined): string {
  if (value === undefined) return '—';
  const n = typeof value === 'bigint' ? value : parseHexAmount(value);
  if (n === BigInt(0)) return '—';
  const ms = n < BigInt(1_000_000_000_000) ? Number(n) * 1000 : Number(n);
  return new Date(ms).toLocaleString();
}

export function PaymentsView() {
  const { data, error, isLoading, lastFetchedAt } = usePoll(fetchPayments, {
    intervalMs: POLL_MS,
  });
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function openDetail(hash: string) {
    setSelectedHash(hash);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const result = await fetchPaymentDetail(hash);
      setDetail(result);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load payment');
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedHash(null);
    setDetail(null);
    setDetailError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Recent payments and failure diagnostics.</p>
        </div>
        <StaleIndicator lastFetchedAt={lastFetchedAt} intervalMs={POLL_MS} />
      </div>

      {isLoading && !data && <TableSkeleton columns={5} />}

      {error && !data && <NodeUnreachableAlert />}

      {data && data.payments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No payments yet. Send a test payment from your Fiber node to populate history.
        </p>
      )}

      {data && data.payments.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <TableRow
                  key={payment.paymentHash}
                  className="cursor-pointer"
                  onClick={() => void openDetail(payment.paymentHash)}
                >
                  <TableCell className="font-mono text-xs" title={payment.paymentHash}>
                    {truncateHash(payment.paymentHash)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">
                    {formatPaymentAmount(
                      payment.amount !== undefined
                        ? parseHexAmount(payment.amount as unknown as string)
                        : undefined,
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">
                    {formatCkbFromShannons(parseHexAmount(payment.fee as unknown as string))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(payment.lastUpdatedAt as unknown as string)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={selectedHash !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment detail</DialogTitle>
            <DialogDescription className="font-mono text-xs break-all">
              {selectedHash}
            </DialogDescription>
          </DialogHeader>

          {detailLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {detailError && <p className="text-sm text-destructive">{detailError}</p>}

          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={detail.payment.status} />
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  Amount:{' '}
                  {formatPaymentAmount(
                    detail.payment.amount !== undefined
                      ? parseHexAmount(detail.payment.amount as unknown as string)
                      : undefined,
                  )}
                </span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  Fee:{' '}
                  {formatCkbFromShannons(parseHexAmount(detail.payment.fee as unknown as string))}
                </span>
              </div>

              {detail.payment.status === 'Failed' && detail.diagnostics.length > 0 ? (
                <DiagnosticList
                  title="Why it failed"
                  diagnostics={detail.diagnostics}
                  context={{ paymentHash: detail.payment.paymentHash }}
                />
              ) : detail.payment.status === 'Failed' ? (
                <p className="text-sm text-muted-foreground">
                  Payment failed but no structured diagnostic was available. Check node logs for
                  details.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {detail.payment.status === 'Success'
                    ? 'Payment completed successfully.'
                    : `Payment is ${detail.payment.status.toLowerCase()}.`}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
