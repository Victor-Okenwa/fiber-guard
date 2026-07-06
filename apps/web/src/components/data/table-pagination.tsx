'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  rangeLabel: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export function TablePagination({
  rangeLabel,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  disabled = false,
}: TablePaginationProps) {
  if (!hasPrevious && !hasNext && rangeLabel.startsWith('0')) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">{rangeLabel}</p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled || !hasPrevious}
          onClick={onPrevious}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled || !hasNext}
          onClick={onNext}
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
