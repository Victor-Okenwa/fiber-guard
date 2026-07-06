'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function truncateMiddle(value: string, head = 10, tail = 4): string {
  return value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}

interface CopyableTruncatedTextProps {
  value: string;
  head?: number;
  tail?: number;
  className?: string;
  /** Stop row click handlers (e.g. payment detail dialog). */
  stopPropagation?: boolean;
}

export function CopyableTruncatedText({
  value,
  head = 10,
  tail = 4,
  className,
  stopPropagation = false,
}: CopyableTruncatedTextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    if (stopPropagation) event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  }

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-0.5', className)}>
      <span className="truncate font-mono" title={value}>
        {truncateMiddle(value, head, tail)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={`Copy ${truncateMiddle(value, head, tail)}`}
        onClick={(event) => void handleCopy(event)}
      >
        {copied ? <CheckIcon className="text-emerald-600 dark:text-emerald-400" /> : <CopyIcon />}
      </Button>
    </span>
  );
}

interface CopyableTextProps {
  value: string;
  className?: string;
  stopPropagation?: boolean;
}

/** Full-value copy control for non-truncated monospace fields (e.g. peer address). */
export function CopyableText({ value, className, stopPropagation = false }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    if (stopPropagation) event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  }

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-0.5', className)}>
      <span className="truncate font-mono" title={value}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Copy"
        onClick={(event) => void handleCopy(event)}
      >
        {copied ? <CheckIcon className="text-emerald-600 dark:text-emerald-400" /> : <CopyIcon />}
      </Button>
    </span>
  );
}
