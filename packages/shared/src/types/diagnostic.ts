export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  title: string;
  explanation: string;
  remediation?: string;
  context?: Record<string, unknown>;
}
