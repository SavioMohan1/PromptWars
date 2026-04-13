import { describe, it, expect } from 'vitest';
import { cn, parseGeminiResult } from '@/lib/utils';

// ─────────────────────────────────────────────
// cn() – Tailwind class merge helper
// ─────────────────────────────────────────────
describe('cn()', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-white')).toBe('text-white');
  });

  it('merges multiple classes', () => {
    expect(cn('p-4', 'mt-2')).toContain('p-4');
    expect(cn('p-4', 'mt-2')).toContain('mt-2');
  });

  it('handles tailwind conflicts – last value wins', () => {
    // tailwind-merge should keep only p-6 when p-4 and p-6 conflict
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  it('handles conditional falsy values without crashing', () => {
    expect(() => cn('text-white', false as any, undefined, null as any)).not.toThrow();
  });
});

// ─────────────────────────────────────────────
// parseGeminiResult() – Core Gemini output parser
// ─────────────────────────────────────────────
describe('parseGeminiResult()', () => {
  it('returns safe defaults on empty input', () => {
    const result = parseGeminiResult('');
    expect(result.docType).toBe('Legal Document');
    expect(result.summary).toBe('');
    expect(result.urgency).toBe('unknown');
    expect(result.facts).toEqual([]);
    expect(result.steps).toEqual([]);
    expect(result.rights).toBe('');
    expect(result.confidence).toBe('high');
  });

  it('extracts summary from a standard Gemini response', () => {
    const input = `## Document Type\nEviction Notice\n\n## Summary\nThis is an eviction notice. You must vacate within 30 days.\n\n## Key Facts\n- Deadline: November 11, 2023\n\n## Urgency\nHigh — you must act immediately.\n\n## Next Steps\n1. Contact a lawyer\n2. Respond in writing\n\n## Rights\nYou have the right to contest this notice.`;
    const result = parseGeminiResult(input);
    expect(result.summary).toContain('eviction notice');
  });

  it('correctly classifies HIGH urgency', () => {
    const input = `## Summary\nYou must act now.\n## Urgency\nThis is HIGH urgency — respond immediately or legal action will follow.`;
    const result = parseGeminiResult(input);
    expect(result.urgency).toBe('high');
  });

  it('correctly classifies MEDIUM urgency', () => {
    const input = `## Summary\nYou have some time.\n## Urgency\nThis is moderate urgency. You have 30 days.`;
    const result = parseGeminiResult(input);
    expect(result.urgency).toBe('medium');
  });

  it('correctly classifies LOW urgency', () => {
    // Parser checks for /low|not urgent|safe/ — "low" must appear before "high" in urgency text
    const input = `## Summary\nThis is informational.\n## Urgency\nNot urgent. This document is low priority and safe to review later.`;
    const result = parseGeminiResult(input);
    expect(result.urgency).toBe('low');
  });

  it('sets confidence to LOW when many hedging words are present', () => {
    const input = `## Summary\nThis may possibly be a contract. It might be unclear. It could potentially seem like a loan. It appears to be a legal notice.`;
    const result = parseGeminiResult(input);
    expect(result.confidence).toBe('low');
  });

  it('sets confidence to MEDIUM for moderate hedging', () => {
    const input = `## Summary\nThis may be a contract. It seems legitimate. It could affect your credit.`;
    const result = parseGeminiResult(input);
    expect(result.confidence).toBe('medium');
  });

  it('keeps confidence HIGH when no hedging words exist', () => {
    const input = `## Summary\nThis is an eviction notice. You must vacate. Deadline is November 11.`;
    const result = parseGeminiResult(input);
    expect(result.confidence).toBe('high');
  });

  it('extracts next steps as an array', () => {
    const input = `## Summary\nSomething.\n## Next Steps\n1. Contact a lawyer\n2. Send a written reply\n3. Keep all documents safe`;
    const result = parseGeminiResult(input);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.some(s => s.toLowerCase().includes('lawyer'))).toBe(true);
  });

  it('extracts key facts from bullet list', () => {
    const input = `## Summary\nSomething.\n## Key Facts\n- Tenant: Rahul Sharma\n- Amount Owed: Rs. 45,000\n- Deadline: November 11, 2023`;
    const result = parseGeminiResult(input);
    expect(result.facts.length).toBeGreaterThan(0);
  });

  it('extracts rights section', () => {
    const input = `## Summary\nSomething.\n## Rights\nYou have the right to contest this eviction under the Rent Control Act.`;
    const result = parseGeminiResult(input);
    expect(result.rights).toContain('right to contest');
  });

  it('falls back: puts content in summary when no structured sections found', () => {
    const weirdInput = `Just a totally unstructured blob of legal text with no headers whatsoever.`;
    const result = parseGeminiResult(weirdInput);
    // Parser falls back to full text OR "No summary provided." — either is valid
    expect(
      result.summary === weirdInput || result.summary === 'No summary provided.'
    ).toBe(true);
  });

  it('does not crash on unusual characters or unicode', () => {
    const unicodeInput = `## Summary\n法律文件。आपको 30 दिनों में खाली करना होगा।\n## Urgency\nHigh`;
    expect(() => parseGeminiResult(unicodeInput)).not.toThrow();
  });
});
