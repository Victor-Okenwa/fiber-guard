import { createFiberClient, DEFAULT_FIBER_RPC_URL } from '@fiberguard/fiber-rpc';

export function getFiberClient() {
  return createFiberClient({
    endpoint: process.env.FIBER_RPC_URL ?? DEFAULT_FIBER_RPC_URL,
  });
}
