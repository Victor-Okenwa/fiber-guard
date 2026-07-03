import { assessNodeHealth } from '@fiberguard/diagnostics';
import { createFiberClient } from '@fiberguard/fiber-rpc';
import { PACKAGE_NAME } from '@fiberguard/shared';

export const VSCODE_EXTENSION_NAME = '@fiberguard/vscode' as const;

export const VSCODE_EXTENSION_DEPENDENCIES = {
  shared: PACKAGE_NAME,
  fiberRpc: '@fiberguard/fiber-rpc',
  diagnostics: '@fiberguard/diagnostics',
} as const;

export { assessNodeHealth, createFiberClient };
