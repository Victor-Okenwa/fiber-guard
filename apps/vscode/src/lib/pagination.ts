export const TREE_PAGE_SIZE = 10;
export const PAYMENTS_PAGE_SIZE = 10;

export function paginateSlice<T>(items: T[], page: number, pageSize = TREE_PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize = TREE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function pageRangeLabel(page: number, total: number, pageSize = TREE_PAGE_SIZE): string {
  if (total === 0) return '0';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${start}–${end} of ${total}`;
}

export function sectionLabel(
  name: string,
  page: number,
  total: number,
  pageSize = TREE_PAGE_SIZE,
): string {
  if (total === 0) return `${name} (0)`;
  if (total <= pageSize) return `${name} (${total})`;
  return `${name} (${pageRangeLabel(page, total, pageSize)})`;
}
