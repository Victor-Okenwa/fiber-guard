import type { Diagnostic } from '@fiberguard/shared';
import { DiagnosticCard } from '@/components/diagnostics/diagnostic-card';

interface DiagnosticListProps {
  diagnostics: Diagnostic[];
  title?: string;
  emptyMessage?: string;
  context?: Record<string, unknown>;
  limit?: number;
}

export function DiagnosticList({
  diagnostics,
  title,
  emptyMessage = 'No diagnostics.',
  context,
  limit,
}: DiagnosticListProps) {
  const items = limit ? diagnostics.slice(0, limit) : diagnostics;

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        items.map((d) => (
          <DiagnosticCard key={`${d.code}-${d.title}`} diagnostic={d} context={context} />
        ))
      )}
    </div>
  );
}
