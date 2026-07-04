import { cn } from '@/lib/utils';

interface LiquidityBarProps {
  localBalance: string;
  capacity: string;
  className?: string;
}

export function LiquidityBar({ localBalance, capacity, className }: LiquidityBarProps) {
  const local = BigInt(localBalance);
  const cap = BigInt(capacity);
  const pct = cap > BigInt(0) ? Number((local * BigInt(100)) / cap) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}
