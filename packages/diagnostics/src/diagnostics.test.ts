import { describe, expect, it } from 'vitest';
import { assessNodeHealth } from './assess-node-health.js';
import { canIPay } from './can-i-pay.js';
import { diagnosePaymentFailure } from './diagnose-payment-failure.js';
import {
  emptyChannels,
  emptyPeers,
  healthyNodeInfo,
  readyChannel,
  samplePeers,
} from './fixtures/node-fixtures.js';
import { getRecommendations } from './get-recommendations.js';

describe('assessNodeHealth', () => {
  it('scores healthy node highly', () => {
    const result = assessNodeHealth(healthyNodeInfo, [readyChannel], samplePeers);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe('healthy');
  });

  it('flags missing peers and channels', () => {
    const lonelyNode = { ...healthyNodeInfo, peerCount: 0n, channelCount: 0n };
    const result = assessNodeHealth(lonelyNode, emptyChannels, emptyPeers);
    expect(result.score).toBeLessThan(50);
    expect(result.diagnostics.some((d) => d.code === 'NO_PEERS')).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'NO_CHANNELS')).toBe(true);
  });
});

describe('diagnosePaymentFailure', () => {
  it('maps route errors to plain English', () => {
    const diagnostics = diagnosePaymentFailure({
      paymentHash: '0x1',
      status: 'Failed',
      fee: 0n,
      failedError: 'Failed to find route: no path available',
    });
    expect(diagnostics[0]?.code).toBe('ROUTE_NOT_FOUND');
    expect(diagnostics[0]?.title).toBe('No viable route');
  });

  it('returns empty for successful payment', () => {
    const diagnostics = diagnosePaymentFailure({
      paymentHash: '0x1',
      status: 'Success',
      fee: 0n,
    });
    expect(diagnostics).toHaveLength(0);
  });
});

describe('canIPay', () => {
  it('blocks when outbound liquidity is insufficient', () => {
    const lowLiquidityChannel = { ...readyChannel, localBalance: 1_000n };
    const result = canIPay(
      { invoice: 'fibt...', amount: 100_000_000n, currency: 'Fibt' },
      [lowLiquidityChannel],
      samplePeers,
      healthyNodeInfo,
    );
    expect(result.probability).toBeLessThan(70);
    expect(result.blockers.some((b) => b.code === 'INSUFFICIENT_LIQUIDITY')).toBe(true);
  });

  it('is optimistic when liquidity and peers look good', () => {
    const result = canIPay(
      { invoice: 'fibt...', amount: 10_000_000n, currency: 'Fibt' },
      [readyChannel],
      samplePeers,
      healthyNodeInfo,
    );
    expect(result.probability).toBeGreaterThanOrEqual(90);
    expect(result.blockers).toHaveLength(0);
  });
});

describe('getRecommendations', () => {
  it('suggests connecting peers when few exist', () => {
    const health = assessNodeHealth(healthyNodeInfo, [readyChannel], samplePeers.slice(0, 1));
    const recs = getRecommendations(health, [readyChannel], samplePeers.slice(0, 1));
    expect(recs.some((r) => r.title.includes('Connect more peers'))).toBe(true);
  });
});
