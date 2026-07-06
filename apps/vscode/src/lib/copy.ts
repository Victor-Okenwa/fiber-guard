import * as vscode from 'vscode';

export async function copyToClipboard(value: string, label = 'Value'): Promise<void> {
  await vscode.env.clipboard.writeText(value);
  void vscode.window.showInformationMessage(`${label} copied to clipboard`);
}
