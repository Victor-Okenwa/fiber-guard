import * as vscode from 'vscode';
import { canIPayCommand } from './commands/can-i-pay.js';
import { diagnosePaymentCommand } from './commands/diagnose-payment.js';
import { nodeStatusCommand } from './commands/node-status.js';
import { viewPaymentsCommand } from './commands/view-payments.js';
import { FiberTreeProvider } from './tree/provider.js';

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel('FiberGuard');
  const treeProvider = new FiberTreeProvider();

  context.subscriptions.push(
    outputChannel,
    vscode.window.registerTreeDataProvider('fiberguard.explorer', treeProvider),
    vscode.commands.registerCommand('fiberguard.refresh', () => treeProvider.refresh()),
    vscode.commands.registerCommand('fiberguard.nodeStatus', () =>
      nodeStatusCommand(outputChannel),
    ),
    vscode.commands.registerCommand('fiberguard.canIPay', () => canIPayCommand(outputChannel)),
    vscode.commands.registerCommand('fiberguard.diagnosePayment', () =>
      diagnosePaymentCommand(outputChannel),
    ),
    vscode.commands.registerCommand('fiberguard.viewPayments', () =>
      viewPaymentsCommand(outputChannel),
    ),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('fiberguard.nodeUrl')) {
        treeProvider.refresh();
      }
    }),
  );
}

export function deactivate(): void {
  // Disposables are cleaned up via context.subscriptions.
}
