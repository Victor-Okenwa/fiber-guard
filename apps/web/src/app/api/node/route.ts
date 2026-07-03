import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function GET() {
  try {
    const client = getFiberClient();
    const node = await client.getNodeInfo();
    return jsonResponse(node);
  } catch (error) {
    return handleApiError(error);
  }
}
