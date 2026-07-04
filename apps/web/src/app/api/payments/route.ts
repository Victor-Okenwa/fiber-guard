import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function GET() {
  try {
    const client = getFiberClient();
    const result = await client.listPayments({ limit: 20 });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
