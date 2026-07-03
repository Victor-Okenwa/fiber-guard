import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function GET() {
  try {
    const client = getFiberClient();
    const channels = await client.listChannels();
    return jsonResponse(channels);
  } catch (error) {
    return handleApiError(error);
  }
}
