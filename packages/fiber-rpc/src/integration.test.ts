import { describe, expect, it } from 'vitest';
import { createFiberClient } from '../src/client.js';

const runIntegration = process.env.FIBER_INTEGRATION === '1';

describe.runIf(runIntegration)('fiber-rpc integration', () => {
  it('connects to local Fiber node', async () => {
    const client = createFiberClient({
      endpoint: process.env.FIBER_RPC_URL ?? 'http://127.0.0.1:8227',
    });
    const info = await client.getNodeInfo();
    expect(info.version).toBeTruthy();
    expect(info.pubkey).toMatch(/^0?2/);
  }, 15_000);
});
