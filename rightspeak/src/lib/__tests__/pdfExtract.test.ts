import { describe, it, expect } from 'vitest';

/**
 * Smoke test: verifies that pdfExtract module exports the expected function
 * without actually running it in a browser/worker environment (which Vitest/jsdom can't do).
 * This ensures the module is importable and the export contract is preserved.
 */
describe('pdfExtract module', () => {
  it('exports extractTextFromPdf as a function', async () => {
    // Dynamic import so the module-level pdfjs setup doesn't execute at import time
    const mod = await import('@/lib/pdfExtract');
    expect(typeof mod.extractTextFromPdf).toBe('function');
  });
});
