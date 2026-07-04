import { diagnosePaymentFailure } from '@fiberguard/diagnostics';
import { handleApiError } from '@/lib/api-error';
import { getFiberClient } from '@/lib/fiber';
import { fetchNodeSnapshot } from '@/lib/fiber-data';
import { jsonResponse } from '@/lib/json';

export async function GET(_request: Request, context: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await context.params;
    if (!hash) {
      return jsonResponse({ error: 'Payment hash is required' }, { status: 400 });
    }

    const client = getFiberClient();
    const payment = await client.getPayment(hash);

    let diagnostics: ReturnType<typeof diagnosePaymentFailure> = [];
    if (payment.status === 'Failed') {
      const { channels, peers } = await fetchNodeSnapshot();
      diagnostics = diagnosePaymentFailure(payment, channels, peers);
    }

    return jsonResponse({ payment, diagnostics });
  } catch (error) {
    return handleApiError(error);
  }
}
