import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getAnthropicApiKey,
  getChatGptApiKey,
  getEnableConsensus,
  getEnableDarkTheme,
  getGeminiApiKey,
  getIsEnabled,
  getLLMModel,
  getLLMWeights,
  getMistralApiKey,
  getSkipMarkedSetting,
  getSleepDuration,
} from '@utils/storage/getProperties';

const storage: Record<string, unknown> = {};
const getStorageItemMock = vi.fn(async (key: string) => storage[key]);

vi.mock('@utils/storage/storageHelper', () => ({
  getStorageItem: (...args: unknown[]) => getStorageItemMock(...args),
}));

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    sleep_duration: 200,
    model: 'gpt-4.1-mini',
    skipMarkedQuestions: false,
    enableConsensus: false,
    enableDarkTheme: false,
    llmWeights: { 'gpt-4.1-mini': 1 },
    enableOpacityOnSkippedQuestions: true,
    automaticFillingEnabled: true,
  },
}));

vi.mock('@utils/llmEngineTypes', () => ({
  getModelName: (modelType: string) =>
    modelType === 'gpt-4.1-mini' ? 'ChatGPT' : modelType,
}));

describe('storage/getProperties', () => {
  afterEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    getStorageItemMock.mockClear();
  });

  it('returns stored sleep duration or default', async () => {
    expect(await getSleepDuration()).toBe(200);
    storage.sleepDuration = 450;
    expect(await getSleepDuration()).toBe(450);
  });

  it('returns stored LLM model or default', async () => {
    expect(await getLLMModel()).toBe('ChatGPT');
    storage.llmModel = 'Custom';
    expect(await getLLMModel()).toBe('Custom');
  });

  it('maps boolean settings with defaults', async () => {
    expect(await getEnableConsensus()).toBe(false);
    storage.enableConsensus = true;
    expect(await getEnableConsensus()).toBe(true);

    expect(await getEnableDarkTheme()).toBe(false);
    storage.enableDarkTheme = true;
    expect(await getEnableDarkTheme()).toBe(true);
  });

  it('resolves skip marked and opacity settings', async () => {
    expect(await getSkipMarkedSetting()).toBe(false);
    storage.skipMarkedQuestions = true;
    expect(await getSkipMarkedSetting()).toBe(true);
  });

  it('returns stored weights or defaults', async () => {
    expect(await getLLMWeights()).toEqual({ 'gpt-4.1-mini': 1 });
    storage.llmWeights = { 'gpt-4.1-mini': 0.4, other: 0.6 };
    expect(await getLLMWeights()).toEqual({
      'gpt-4.1-mini': 0.4,
      other: 0.6,
    });
  });

  it('returns API keys or empty string', async () => {
    expect(await getChatGptApiKey()).toBe('');
    storage.chatGptApiKey = 'key';
    expect(await getChatGptApiKey()).toBe('key');
    expect(await getGeminiApiKey()).toBe('');
    expect(await getMistralApiKey()).toBe('');
    expect(await getAnthropicApiKey()).toBe('');
  });

  it('returns automatic filling flag with default', async () => {
    expect(await getIsEnabled()).toBe(true);
    storage.automaticFillingEnabled = false;
    expect(await getIsEnabled()).toBe(false);
  });
});



