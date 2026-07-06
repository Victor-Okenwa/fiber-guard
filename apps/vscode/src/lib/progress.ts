import * as vscode from 'vscode';

/** Run a long RPC call with a cancellable progress notification. Returns undefined if cancelled. */
export function withRpcProgress<T>(title: string, fn: () => Promise<T>): Promise<T | undefined> {
  return Promise.resolve(
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true,
      },
      async (_progress, token) => {
        const result = await fn();
        return token.isCancellationRequested ? undefined : result;
      },
    ),
  );
}
