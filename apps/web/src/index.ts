import { assessNodeHealth } from '@fiberguard/diagnostics';
import { createFiberClient } from '@fiberguard/fiber-rpc';
import { PACKAGE_NAME } from '@fiberguard/shared';

export const WEB_APP_NAME = '@fiberguard/web' as const;

export const WEB_APP_DEPENDENCIES = {
  shared: PACKAGE_NAME,
  fiberRpc: '@fiberguard/fiber-rpc',
  diagnostics: '@fiberguard/diagnostics',
} as const;

export { assessNodeHealth, createFiberClient };
