import { FiberRpcError } from '@fiberguard/fiber-rpc';
import { jsonResponse } from '@/lib/json';

export function handleApiError(error: unknown): Response {
  if (error instanceof FiberRpcError) {
    return jsonResponse(
      {
        error: error.message,
        method: error.method,
        remediation:
          'Check that your Fiber node is running and FIBER_RPC_URL points to the correct endpoint.',
      },
      { status: 503 },
    );
  }

  return jsonResponse(
    {
      error: 'An unexpected error occurred',
      remediation: 'Check server logs for details.',
    },
    { status: 500 },
  );
}
