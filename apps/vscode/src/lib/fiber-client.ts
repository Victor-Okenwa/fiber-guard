import { createFiberClient, type FiberClient } from '@fiberguard/fiber-rpc';
import * as vscode from 'vscode';

export const DEFAULT_NODE_URL = 'http://127.0.0.1:8227';

export function getNodeUrl(): string {
  return (
    vscode.workspace.getConfiguration('fiberguard').get<string>('nodeUrl')?.trim() ||
    DEFAULT_NODE_URL
  );
}

/** Always reads the current setting so URL changes apply without reload. */
export function getFiberClient(): FiberClient {
  return createFiberClient({ endpoint: getNodeUrl() });
}
