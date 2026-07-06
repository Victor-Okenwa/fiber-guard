import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), MAX_LIMIT) : DEFAULT_LIMIT;
    const after = searchParams.get('after') ?? undefined;

    const client = getFiberClient();
    const result = await client.listPayments({ limit, after });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
