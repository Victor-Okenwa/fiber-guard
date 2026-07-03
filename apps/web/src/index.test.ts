import { describe, expect, it } from 'vitest';
import { WEB_APP_DEPENDENCIES, WEB_APP_NAME } from './index.js';

describe('@fiberguard/web', () => {
  it('exports web app name', () => {
    expect(WEB_APP_NAME).toBe('@fiberguard/web');
  });

  it('references workspace packages', () => {
    expect(WEB_APP_DEPENDENCIES.shared).toBe('@fiberguard/shared');
    expect(WEB_APP_DEPENDENCIES.fiberRpc).toBe('@fiberguard/fiber-rpc');
    expect(WEB_APP_DEPENDENCIES.diagnostics).toBe('@fiberguard/diagnostics');
  });
});
