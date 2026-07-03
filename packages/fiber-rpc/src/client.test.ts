import { describe, expect, it } from 'vitest';
import { createFiberClient } from './client.js';

describe('createFiberClient', () => {
  it('uses default endpoint', () => {
    const client = createFiberClient();
    expect(client.endpoint).toBe('http://127.0.0.1:8227');
  });

  it('accepts custom endpoint', () => {
    const client = createFiberClient({ endpoint: 'http://localhost:9999' });
    expect(client.endpoint).toBe('http://localhost:9999');
  });
});
