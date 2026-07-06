'use client';

import { useEffect, useMemo, useState } from 'react';

export const TABLE_PAGE_SIZE = 10;

export function useClientPagination<T>(items: T[] | null | undefined, pageSize = TABLE_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const total = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (!items?.length) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  return {
    page,
    pageItems,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    rangeLabel: total === 0 ? '0 items' : `${rangeStart}–${rangeEnd} of ${total}`,
    goPrevious: () => setPage((current) => Math.max(1, current - 1)),
    goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
    setPage,
  };
}
