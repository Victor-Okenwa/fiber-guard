interface StaleIndicatorProps {
  lastFetchedAt: number | null;
  intervalMs: number;
}

export function StaleIndicator({ lastFetchedAt, intervalMs }: StaleIndicatorProps) {
  if (!lastFetchedAt) return null;
  const isStale = Date.now() - lastFetchedAt > intervalMs * 1.5;
  if (!isStale) return null;

  return (
    <span className="text-xs text-amber-600 dark:text-amber-400">
      Data may be stale — last updated {new Date(lastFetchedAt).toLocaleTimeString()}
    </span>
  );
}
