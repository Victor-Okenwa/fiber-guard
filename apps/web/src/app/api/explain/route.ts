import type { Diagnostic } from '@fiberguard/shared';
import { explainDiagnostic, isGroqConfigured } from '@/lib/groq';
import { jsonResponse } from '@/lib/json';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      diagnostic?: Diagnostic;
      context?: Record<string, unknown>;
    };

    if (!body.diagnostic?.code || !body.diagnostic?.title) {
      return jsonResponse({ error: 'Missing diagnostic in request body' }, { status: 400 });
    }

    if (!isGroqConfigured()) {
      return jsonResponse({
        explanation: body.diagnostic.explanation,
        source: 'static',
      });
    }

    try {
      const explanation = await explainDiagnostic(body.diagnostic, body.context);
      return jsonResponse({ explanation, source: 'groq' });
    } catch {
      return jsonResponse({
        explanation: body.diagnostic.explanation,
        source: 'static',
      });
    }
  } catch {
    return jsonResponse({ error: 'Invalid request' }, { status: 400 });
  }
}
