'use client';

import type { Diagnostic } from '@fiberguard/shared';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { fetchExplain } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const severityVariant: Record<Diagnostic['severity'], string> = {
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  error: 'bg-destructive/15 text-destructive',
};

interface DiagnosticCardProps {
  diagnostic: Diagnostic;
  context?: Record<string, unknown>;
}

export function DiagnosticCard({ diagnostic, context }: DiagnosticCardProps) {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const displayExplanation = aiExplanation ?? diagnostic.explanation;

  async function handleExplain() {
    setIsExplaining(true);
    try {
      const result = await fetchExplain(diagnostic, context);
      setAiExplanation(result.explanation);
    } catch {
      setAiExplanation(diagnostic.explanation);
    } finally {
      setIsExplaining(false);
    }
  }

  return (
    <Alert className="min-w-0 overflow-hidden">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <AlertTitle className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {diagnostic.title}
          <Badge className={cn('text-xs', severityVariant[diagnostic.severity])}>
            {diagnostic.severity}
          </Badge>
        </AlertTitle>
        <Button
          className="shrink-0"
          variant="outline"
          size="xs"
          onClick={() => void handleExplain()}
          disabled={isExplaining}
        >
          {isExplaining ? 'Thinking…' : 'Explain'}
        </Button>
      </div>
      <AlertDescription className="mt-2 min-w-0 space-y-2">
        {aiExplanation ? (
          <MarkdownContent content={aiExplanation} />
        ) : (
          <p className="min-w-0 wrap-anywhere leading-relaxed">
            {displayExplanation}
          </p>
        )}
        {diagnostic.remediation && !aiExplanation && (
          <p className="min-w-0 wrap-anywhere text-sm text-muted-foreground">
            <span className="font-medium">Fix:</span> {diagnostic.remediation}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
