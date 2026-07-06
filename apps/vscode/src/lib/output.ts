import type * as vscode from 'vscode';

export function logSection(channel: vscode.OutputChannel, title: string): void {
  channel.appendLine('');
  channel.appendLine(`── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
}

export function logLines(channel: vscode.OutputChannel, text: string): void {
  for (const line of text.split('\n')) {
    channel.appendLine(line);
  }
}
