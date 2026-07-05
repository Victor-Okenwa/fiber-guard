import type { Diagnostic } from '@fiberguard/shared';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function explainDiagnostic(
  diagnostic: Diagnostic,
  extraContext?: Record<string, unknown>,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content:
            'You are FiberGuard, an assistant for Fiber node operators on Nervos CKB. Explain diagnostics in plain English for developers running payment channel nodes. Be concise. Use markdown formatting: put each section on its own line with labels **Issue:**, **Why it matters:**, and **Fix:**. Use `backticks` for RPC commands and method names. Do not invent RPC data not provided in the context.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            diagnostic,
            context: extraContext ?? {},
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Groq returned empty response');
  }

  return content;
}
