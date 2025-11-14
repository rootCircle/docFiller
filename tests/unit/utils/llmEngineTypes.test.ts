import { describe, expect, it, vi } from 'vitest';

vi.mock('@utils/settings', () => ({
  EMPTY_STRING: '',
}));
import {
  LLMEngineType,
  LLM_REQUIREMENTS,
  getAPIPlatformSourceLink,
  getModelName,
  getModelTypeFromName,
} from '@utils/llmEngineTypes';

describe('llmEngineTypes', () => {
  it('maps model types to names and back', () => {
    expect(getModelName(LLMEngineType.ChatGPT)).toBe('ChatGPT');
    expect(getModelTypeFromName('Gemini')).toBe(LLMEngineType.Gemini);
    expect(getModelTypeFromName('Unknown')).toBeNull();
  });

  it('provides API platform links', () => {
    expect(getAPIPlatformSourceLink(LLMEngineType.ChatGPT)).toContain('openai');
    expect(getAPIPlatformSourceLink(LLMEngineType.Ollama)).toBe('');
  });

  it('exposes requirement metadata', () => {
    expect(LLM_REQUIREMENTS[LLMEngineType.ChatGPT].requiresApiKey).toBe(true);
    expect(LLM_REQUIREMENTS[LLMEngineType.Ollama].requiresApiKey).toBe(false);
  });
});

