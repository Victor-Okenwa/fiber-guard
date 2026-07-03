const SHANNONS_PER_CKB = 100_000_000n;

/** Parse Fiber/CKB hex amount string (e.g. `0x5f5e100`) to bigint shannons. */
export function parseHexAmount(value: string | bigint | undefined | null): bigint {
  if (value === undefined || value === null) return 0n;
  if (typeof value === 'bigint') return value;
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    return BigInt(trimmed);
  }
  return BigInt(trimmed);
}

/** Format shannons as CKB with up to 8 decimal places (no floating-point math). */
export function formatCkbFromShannons(shannons: bigint, decimals = 4): string {
  const negative = shannons < 0n;
  const abs = negative ? -shannons : shannons;
  const whole = abs / SHANNONS_PER_CKB;
  const fraction = abs % SHANNONS_PER_CKB;
  const fractionStr = fraction.toString().padStart(8, '0').slice(0, decimals).replace(/0+$/, '');
  const sign = negative ? '-' : '';
  return fractionStr ? `${sign}${whole}.${fractionStr} CKB` : `${sign}${whole} CKB`;
}

export function formatShannons(shannons: bigint): string {
  return `${shannons} shannons`;
}

export function channelCapacity(localBalance: bigint, remoteBalance: bigint): bigint {
  return localBalance + remoteBalance;
}
