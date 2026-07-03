import { describe, expect, it } from 'vitest';
import { DIAGNOSTIC_CODES, healthStatusFromScore, PACKAGE_NAME } from './index.js';

describe('@fiberguard/shared', () => {
  it('exports package name', () => {
    expect(PACKAGE_NAME).toBe('@fiberguard/shared');
  });

  it('maps health scores to status', () => {
    expect(healthStatusFromScore(90)).toBe('healthy');
    expect(healthStatusFromScore(60)).toBe('degraded');
    expect(healthStatusFromScore(20)).toBe('critical');
  });

  it('exports diagnostic codes', () => {
    expect(DIAGNOSTIC_CODES.NO_PEERS).toBe('NO_PEERS');
  });
});
