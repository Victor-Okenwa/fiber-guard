'use client';

import { StaleIndicator } from '@/components/data/stale-indicator';
import { DiagnosticList } from '@/components/diagnostics/diagnostic-list';
import { HealthSummaryCard } from '@/components/health/health-summary-card';
import { NodeInfoCard } from '@/components/node/node-info-card';
import { NodeUnreachableAlert } from '@/components/node/node-unreachable-alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoll } from '@/hooks/use-poll';
import { fetchHealth } from '@/lib/api-client';

const POLL_MS = 15_000;

export function DashboardView() {
  const { data, error, isLoading, lastFetchedAt } = usePoll(fetchHealth, {
    intervalMs: POLL_MS,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Node health and diagnostics at a glance.</p>
        </div>

        <StaleIndicator lastFetchedAt={lastFetchedAt} intervalMs={POLL_MS} />
      </div>

      {isLoading && !data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      )}

      {error && !data && (
        <NodeUnreachableAlert
          remediation={
            error && 'remediation' in error
              ? String((error as Error & { remediation?: string }).remediation)
              : undefined
          }
        />
      )}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <HealthSummaryCard score={data.health.score} status={data.health.status} />
            <NodeInfoCard node={data.node} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <DiagnosticList
              title="Diagnostics"
              diagnostics={data.health.diagnostics}
              limit={5}
              emptyMessage="No issues detected."
            />
            <DiagnosticList
              title="Recommendations"
              diagnostics={data.recommendations}
              limit={5}
              emptyMessage="No recommendations right now."
            />
          </div>
        </>
      )}
    </div>
  );
}
