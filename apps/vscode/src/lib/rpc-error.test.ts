import { FiberRpcError } from '@fiberguard/fiber-rpc';
import { describe, expect, it } from 'vitest';
import { describeRpcError } from './rpc-error.js';

describe('describeRpcError', () => {
  it('produces actionable message for FiberRpcError', () => {
    const error = new FiberRpcError('getNodeInfo failed', {
      method: 'getNodeInfo',
      endpoint: 'http://127.0.0.1:8227',
      cause: new Error('connection refused'),
    });
    const report = describeRpcError(error);
    expect(report.message).toContain('getNodeInfo');
    expect(report.message).toContain('http://127.0.0.1:8227');
    expect(report.message).toContain('fiberguard.nodeUrl');
    expect(report.detail).toBe('connection refused');
  });

  it('handles unexpected errors without leaking stack into the message', () => {
    const report = describeRpcError(new Error('boom'));
    expect(report.message).not.toContain('boom');
    expect(report.detail).toContain('boom');
  });
});
