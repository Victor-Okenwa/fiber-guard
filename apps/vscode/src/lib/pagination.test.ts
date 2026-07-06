import { describe, expect, it } from 'vitest';
import { pageRangeLabel, paginateSlice, sectionLabel, totalPages } from './pagination.js';

describe('pagination', () => {
  it('slices items for the current page', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    expect(paginateSlice(items, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginateSlice(items, 2, 5)).toEqual([6, 7, 8, 9, 10]);
    expect(paginateSlice(items, 3, 5)).toEqual([11]);
  });

  it('computes total pages', () => {
    expect(totalPages(0, 10)).toBe(1);
    expect(totalPages(10, 10)).toBe(1);
    expect(totalPages(11, 10)).toBe(2);
  });

  it('formats page range labels', () => {
    expect(pageRangeLabel(1, 25, 10)).toBe('1–10 of 25');
    expect(pageRangeLabel(3, 25, 10)).toBe('21–25 of 25');
  });

  it('formats section labels', () => {
    expect(sectionLabel('Channels', 1, 0)).toBe('Channels (0)');
    expect(sectionLabel('Channels', 1, 4)).toBe('Channels (4)');
    expect(sectionLabel('Channels', 2, 25)).toBe('Channels (11–20 of 25)');
  });
});
