import { describe, expect, it } from 'vitest';
import { channelCapacity, formatCkbFromShannons, parseHexAmount } from './amount.js';

describe('parseHexAmount', () => {
  it('parses hex strings', () => {
    expect(parseHexAmount('0x5f5e100')).toBe(100_000_000n);
  });

  it('returns bigint unchanged', () => {
    expect(parseHexAmount(42n)).toBe(42n);
  });
});

describe('formatCkbFromShannons', () => {
  it('formats whole CKB', () => {
    expect(formatCkbFromShannons(100_000_000n)).toBe('1 CKB');
  });

  it('formats fractional CKB', () => {
    expect(formatCkbFromShannons(150_000_000n)).toBe('1.5 CKB');
  });
});

describe('channelCapacity', () => {
  it('sums local and remote balance', () => {
    expect(channelCapacity(300n, 200n)).toBe(500n);
  });
});
