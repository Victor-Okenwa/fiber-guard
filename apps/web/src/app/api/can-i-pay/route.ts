import { canIPay } from '@fiberguard/diagnostics';
import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { fetchNodeSnapshot } from '@/lib/fiber-data';
import { jsonResponse } from '@/lib/json';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { invoice?: string };
    if (!body.invoice || typeof body.invoice !== 'string') {
      return jsonResponse({ error: 'Missing invoice string in request body' }, { status: 400 });
    }

    const client = getFiberClient();
    const parsed = await client.parseInvoice(body.invoice);
    const { node, channels, peers } = await fetchNodeSnapshot();
    const result = canIPay(parsed, channels, peers, node);

    return jsonResponse({
      invoice: parsed,
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
