export class FiberRpcError extends Error {
  readonly method: string;
  readonly endpoint: string;
  readonly cause: unknown;

  constructor(message: string, options: { method: string; endpoint: string; cause?: unknown }) {
    super(message);
    this.name = 'FiberRpcError';
    this.method = options.method;
    this.endpoint = options.endpoint;
    this.cause = options.cause;
  }
}

export async function wrapRpcCall<T>(
  method: string,
  endpoint: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new FiberRpcError(`${method} failed`, { method, endpoint, cause: error });
  }
}
