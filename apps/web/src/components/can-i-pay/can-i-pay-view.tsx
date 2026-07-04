'use client';

import { formatCkbFromShannons, parseHexAmount } from '@fiberguard/shared';
import { useState } from 'react';
import { DiagnosticList } from '@/components/diagnostics/diagnostic-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CanIPayResponse } from '@/lib/api-client';
import { fetchCanIPay } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function probabilityColor(probability: number): string {
  if (probability >= 70) return 'bg-emerald-500';
  if (probability >= 40) return 'bg-amber-500';
  return 'bg-destructive';
}

export function CanIPayView() {
  const [invoice, setInvoice] = useState('');
  const [result, setResult] = useState<CanIPayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleCheck(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = invoice.trim();
    if (!trimmed) return;

    setIsChecking(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchCanIPay(trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setIsChecking(false);
    }
  }

  const amount =
    result?.invoice.amount !== undefined
      ? formatCkbFromShannons(parseHexAmount(result.invoice.amount as unknown as string))
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Can I Pay?</h1>
        <p className="text-muted-foreground">Predict payment success before sending funds.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice checker</CardTitle>
          <CardDescription>
            Paste a Fiber invoice to preview amount, blockers, and success probability before you
            call sendPayment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => void handleCheck(e)}>
            <Input
              placeholder="fibb… or invoice string"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              aria-label="Invoice"
            />
            <Button type="submit" disabled={isChecking || !invoice.trim()}>
              {isChecking ? 'Checking…' : 'Check invoice'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {amount && (
                <p>
                  <span className="font-medium">Amount:</span>{' '}
                  <span className="font-mono tabular-nums">{amount}</span>
                </p>
              )}
              {result.invoice.currency && (
                <p>
                  <span className="font-medium">Currency:</span> {result.invoice.currency}
                </p>
              )}
              {result.invoice.description && (
                <p>
                  <span className="font-medium">Description:</span> {result.invoice.description}
                </p>
              )}
              {result.invoice.paymentHash && (
                <p className="font-mono text-xs break-all text-muted-foreground">
                  Hash: {result.invoice.paymentHash}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success probability</CardTitle>
              <CardDescription>
                {result.probability >= 70
                  ? 'Likely to succeed — you can try sendPayment.'
                  : result.probability >= 40
                    ? 'May fail — fix warnings before sending.'
                    : 'Unlikely to succeed — resolve blockers before sendPayment.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      probabilityColor(result.probability),
                    )}
                    style={{ width: `${result.probability}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-lg font-semibold tabular-nums">
                  {result.probability}%
                </span>
              </div>
            </CardContent>
          </Card>

          <DiagnosticList
            title="Blockers"
            diagnostics={result.blockers}
            emptyMessage="No blockers — routing looks healthy."
          />
        </div>
      )}
    </div>
  );
}
