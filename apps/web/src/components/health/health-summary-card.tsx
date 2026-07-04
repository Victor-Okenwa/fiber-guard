import type { HealthStatus } from '@fiberguard/shared';
import { cn } from '@/lib/utils';

const statusStyles: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  degraded: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  critical: 'bg-destructive/15 text-destructive',
};

const statusLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
};

interface HealthSummaryCardProps {
  score: number;
  status: HealthStatus;
}

export function HealthSummaryCard({ score, status }: HealthSummaryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">Node health</p>
      <div className="mt-2 flex items-end gap-3">
        <span className="text-4xl font-semibold tabular-nums">{score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
        <span
          className={cn('ml-auto rounded-full px-3 py-1 text-xs font-medium', statusStyles[status])}
        >
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}
