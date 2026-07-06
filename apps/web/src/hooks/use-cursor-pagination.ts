'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const TABLE_PAGE_SIZE = 10;

export interface CursorPageResult<T> {
  items: T[];
  lastCursor?: string;
}

interface UseCursorPaginationOptions {
  pageSize?: number;
  intervalMs?: number;
  enabled?: boolean;
}

export function useCursorPagination<T>(
  fetchPage: (after?: string) => Promise<CursorPageResult<T>>,
  options: UseCursorPaginationOptions = {},
) {
  const { pageSize = TABLE_PAGE_SIZE, intervalMs = 30_000, enabled = true } = options;
  const [pageIndex, setPageIndex] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const cursorsRef = useRef<(string | undefined)[]>([undefined]);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const loadPage = useCallback(
    async (index: number) => {
      setIsLoading(true);
      try {
        const after = cursorsRef.current[index];
        const result = await fetchPageRef.current(after);
        setItems(result.items);
        setError(null);
        setLastFetchedAt(Date.now());

        const nextCursor = result.lastCursor;
        const pageHasNext = Boolean(nextCursor && result.items.length >= pageSize);
        setHasNext(pageHasNext);

        if (nextCursor) {
          const cursors = cursorsRef.current;
          if (cursors.length === index + 1) {
            cursors.push(nextCursor);
          } else if (cursors.length > index + 1) {
            cursors[index + 1] = nextCursor;
            cursors.length = index + 2;
          }
        } else if (cursorsRef.current.length > index + 1) {
          cursorsRef.current.length = index + 1;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  const refresh = useCallback(async () => {
    await loadPage(pageIndex);
  }, [loadPage, pageIndex]);

  useEffect(() => {
    if (!enabled) return;
    void loadPage(pageIndex);
  }, [enabled, loadPage, pageIndex]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => void loadPage(pageIndex), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, loadPage, pageIndex]);

  const goNext = useCallback(() => {
    if (!hasNext) return;
    setPageIndex((current) => current + 1);
  }, [hasNext]);

  const goPrevious = useCallback(() => {
    setPageIndex((current) => Math.max(0, current - 1));
  }, []);

  const rangeLabel =
    items.length === 0
      ? '0 items'
      : `Page ${pageIndex + 1}${hasNext ? '+' : ''} · ${items.length} item${items.length === 1 ? '' : 's'}`;

  return {
    items,
    error,
    isLoading,
    lastFetchedAt,
    refresh,
    pageIndex,
    hasPrevious: pageIndex > 0,
    hasNext,
    rangeLabel,
    goPrevious,
    goNext,
  };
}
