import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { invoice?: string };
    if (!body.invoice || typeof body.invoice !== 'string') {
      return jsonResponse({ error: 'Missing invoice string in request body' }, { status: 400 });
    }

    const client = getFiberClient();
    const parsed = await client.parseInvoice(body.invoice);
    return jsonResponse(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}
