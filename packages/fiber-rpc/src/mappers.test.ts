import { describe, expect, it } from 'vitest';
import { FiberRpcError } from './errors.js';
import { mapChannel, mapPayment } from './mappers.js';

describe('FiberRpcError', () => {
  it('captures method and endpoint', () => {
    const error = new FiberRpcError('listChannels failed', {
      method: 'listChannels',
      endpoint: 'http://127.0.0.1:8227',
      cause: new Error('timeout'),
    });
    expect(error.method).toBe('listChannels');
    expect(error.endpoint).toContain('8227');
  });
});

describe('mappers', () => {
  it('maps channel balances to bigint', () => {
    const channel = mapChannel({
      channelId: '0xabc',
      isPublic: true,
      channelOutpoint: '0x1',
      pubkey: '02aa',
      state: { stateName: 'ChannelReady', stateFlags: '' },
      localBalance: '0x5f5e100',
      offeredTlcBalance: '0x0',
      remoteBalance: '0x0',
      receivedTlcBalance: '0x0',
      createdAt: '0x1',
      enabled: true,
      tlcExpiryDelta: '0x1',
      tlcFeeProportionalMillionths: '0x3e8',
    });
    expect(channel.stateName).toBe('ChannelReady');
    expect(channel.localBalance).toBe(100_000_000n);
    expect(channel.capacity).toBe(100_000_000n);
  });

  it('maps failed payment', () => {
    const payment = mapPayment({
      paymentHash: '0xdead',
      status: 'Failed',
      createdAt: '0x1',
      lastUpdatedAt: '0x2',
      failedError: 'route not found',
      fee: '0x0',
    });
    expect(payment.status).toBe('Failed');
    expect(payment.failedError).toBe('route not found');
  });

  it('derives amount from router first hop', () => {
    const payment = mapPayment({
      paymentHash: '0xabc',
      status: 'Success',
      createdAt: '0x1',
      lastUpdatedAt: '0x2',
      fee: '0x0',
      router: [{ pubkey: '02aa', amount: '0x2540be400', channelOutpoint: '0x1:0x0' }],
    });
    expect(payment.amount).toBe(10_000_000_000n);
  });
});
