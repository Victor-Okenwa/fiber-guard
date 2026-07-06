import * as vscode from 'vscode';
import { logLines, logSection } from '../lib/output.js';
import { describeRpcError } from '../lib/rpc-error.js';

export function reportError(channel: vscode.OutputChannel, error: unknown): void {
  const report = describeRpcError(error);
  if (report.detail) {
    logSection(channel, 'Error');
    logLines(channel, report.detail);
  }
  void vscode.window.showErrorMessage(report.message);
}
