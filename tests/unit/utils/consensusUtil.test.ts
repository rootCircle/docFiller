import { describe, expect, it } from 'vitest';

import { LLMEngineType } from '@utils/llmEngineTypes';
vi.mock('@utils/settings', () => ({
  EMPTY_STRING: '',
}));

import { analyzeWeightedObjects } from '@utils/consensusUtil';

describe('analyzeWeightedObjects', () => {
  it('returns empty object when no responses are provided', () => {
    expect(analyzeWeightedObjects([])).toEqual({});
  });

  it('selects values with highest weight for each field', () => {
    const result = analyzeWeightedObjects([
      {
        source: LLMEngineType.ChatGPT,
        weight: 0.4,
        value: { text: 'Option A', linearScale: { answer: 2 } },
      },
      {
        source: LLMEngineType.Mistral,
        weight: 0.6,
        value: { text: 'Option B', linearScale: { answer: 4 } },
      },
    ]);

    expect(result).toEqual({
      text: 'Option B',
      linearScale: { answer: 4 },
    });
  });

  it('maintains nested objects and arrays', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const result = analyzeWeightedObjects([
      {
        source: LLMEngineType.ChatGPT,
        weight: 0.3,
        value: {
          checkboxGrid: [{ row: 'Row 1', cols: [{ data: 'Col 1' }] }],
          meta: { note: 'First' },
        },
      },
      {
        source: LLMEngineType.Gemini,
        weight: 0.8,
        value: {
          checkboxGrid: [{ row: 'Row 1', cols: [{ data: 'Col 2' }] }],
          meta: { note: 'Second' },
          date,
        },
      },
    ]);

    expect(result).toEqual({
      checkboxGrid: [{ row: 'Row 1', cols: [{ data: 'Col 2' }] }],
      meta: { note: 'Second' },
      date,
    });
  });
});

