import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function GET() {
  try {
    const client = getFiberClient();
    const peers = await client.listPeers();
    return jsonResponse(peers);
  } catch (error) {
    return handleApiError(error);
  }
}
