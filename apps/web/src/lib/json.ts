function serializeBigInt(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function serializeForJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, serializeBigInt)) as T;
}

export function jsonResponse<T>(data: T, init?: ResponseInit): Response {
  return Response.json(serializeForJson(data), init);
}
