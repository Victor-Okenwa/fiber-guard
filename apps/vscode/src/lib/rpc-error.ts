import { FiberRpcError } from '@fiberguard/fiber-rpc';

export interface RpcErrorReport {
  /** Short actionable message for showErrorMessage. */
  message: string;
  /** Extra detail for the output channel (never shown in a toast). */
  detail?: string;
}

export function describeRpcError(error: unknown): RpcErrorReport {
  if (error instanceof FiberRpcError) {
    return {
      message: `Fiber RPC ${error.method} failed. Is your Fiber node running at ${error.endpoint}? Check the fiberguard.nodeUrl setting.`,
      detail: error.cause instanceof Error ? error.cause.message : String(error.cause ?? ''),
    };
  }
  return {
    message: 'FiberGuard hit an unexpected error. See the FiberGuard output channel for details.',
    detail: error instanceof Error ? (error.stack ?? error.message) : String(error),
  };
}
