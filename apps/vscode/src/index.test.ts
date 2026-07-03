import { describe, expect, it } from 'vitest';
import { VSCODE_EXTENSION_DEPENDENCIES, VSCODE_EXTENSION_NAME } from './index.js';

describe('@fiberguard/vscode', () => {
  it('exports extension name', () => {
    expect(VSCODE_EXTENSION_NAME).toBe('@fiberguard/vscode');
  });

  it('references workspace packages', () => {
    expect(VSCODE_EXTENSION_DEPENDENCIES.shared).toBe('@fiberguard/shared');
    expect(VSCODE_EXTENSION_DEPENDENCIES.fiberRpc).toBe('@fiberguard/fiber-rpc');
    expect(VSCODE_EXTENSION_DEPENDENCIES.diagnostics).toBe('@fiberguard/diagnostics');
  });
});
