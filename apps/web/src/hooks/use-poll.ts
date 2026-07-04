'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePollOptions {
  intervalMs?: number;
  enabled?: boolean;
}

interface UsePollState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  lastFetchedAt: number | null;
  refresh: () => Promise<void>;
}

export function usePoll<T>(
  fetcher: () => Promise<T>,
  options: UsePollOptions = {},
): UsePollState<T> {
  const { intervalMs = 15_000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setLastFetchedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const id = setInterval(() => void refresh(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, refresh]);

  return { data, error, isLoading, lastFetchedAt, refresh };
}
