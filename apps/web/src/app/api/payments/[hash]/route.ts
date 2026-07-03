import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { jsonResponse } from '@/lib/json';

export async function GET(_request: Request, context: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await context.params;
    if (!hash) {
      return jsonResponse({ error: 'Payment hash is required' }, { status: 400 });
    }

    const client = getFiberClient();
    const payment = await client.getPayment(hash);
    return jsonResponse(payment);
  } catch (error) {
    return handleApiError(error);
  }
}
