import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  setAnthropicApiKey,
  setChatGptApiKey,
  setEnableConsensus,
  setEnableDarkTheme,
  setEnableOpacityOnSkippedQuestions,
  setGeminiApiKey,
  setLLMModel,
  setLLMWeights,
  setMistralApiKey,
  setSkipMarkedSetting,
  setSleepDuration,
  setToggleSkipMarkedStatus,
} from '@utils/storage/setProperties';

const setStorageItemMock = vi.fn(async () => undefined);
const getSkipMarkedSettingMock = vi.fn(async () => false);

vi.mock('@utils/storage/storageHelper', () => ({
  setStorageItem: (...args: unknown[]) => setStorageItemMock(...args),
}));

vi.mock('@utils/storage/getProperties', () => ({
  getSkipMarkedSetting: (...args: unknown[]) => getSkipMarkedSettingMock(...args),
}));

describe('storage/setProperties', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('writes primitive values to storage', async () => {
    await setSleepDuration(400);
    await setLLMModel('custom');
    await setSkipMarkedSetting(true);
    await setEnableOpacityOnSkippedQuestions(true);
    await setEnableConsensus(true);
    await setEnableDarkTheme(true);
    await setChatGptApiKey('chat');
    await setGeminiApiKey('gemini');
    await setMistralApiKey('mistral');
    await setAnthropicApiKey('anthropic');

    expect(setStorageItemMock).toHaveBeenCalledTimes(10);
  });

  it('stores weight maps', async () => {
    await setLLMWeights({ a: 0.4, b: 0.6 } as any);
    expect(setStorageItemMock).toHaveBeenCalledWith('llmWeights', {
      a: 0.4,
      b: 0.6,
    });
  });

  it('toggles skip marked status using current value', async () => {
    getSkipMarkedSettingMock.mockResolvedValueOnce(false);
    await setToggleSkipMarkedStatus();
    expect(setStorageItemMock).toHaveBeenCalledWith('skipMarkedQuestions', true);
  });
});



