import { afterEach, describe, expect, it, vi } from 'vitest';

import { LLMEngineType } from '@utils/llmEngineTypes';
import { Settings } from '@utils/settings';

const sleepDurationMock = vi.fn();
const llmModelMock = vi.fn();
const enableConsensusMock = vi.fn();
const enableDarkThemeMock = vi.fn();
const llmWeightsMock = vi.fn();

vi.mock('@utils/storage/getProperties', () => ({
  getSleepDuration: (...args: unknown[]) => sleepDurationMock(...args),
  getLLMModel: (...args: unknown[]) => llmModelMock(...args),
  getEnableConsensus: (...args: unknown[]) => enableConsensusMock(...args),
  getEnableDarkTheme: (...args: unknown[]) => enableDarkThemeMock(...args),
  getLLMWeights: (...args: unknown[]) => llmWeightsMock(...args),
}));

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    sleep_duration: 150,
    model: 'gpt-4.1-mini',
    enableConsensus: false,
    enableDarkTheme: false,
    llmWeights: {
      'gpt-4.1-mini': 1,
      'gemini-2.5-flash-lite': 0,
    },
  },
}));

describe('Settings singleton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('caches async values after first read', async () => {
    sleepDurationMock.mockResolvedValueOnce(500);
    const instance = Settings.getInstance();

    const sleepOne = await instance.getSleepDuration();
    const sleepTwo = await instance.getSleepDuration();

    expect(sleepOne).toBe(500);
    expect(sleepTwo).toBe(500);
    expect(sleepDurationMock).toHaveBeenCalledTimes(1);
  });

  it('returns default model until storage is loaded', async () => {
    llmModelMock.mockResolvedValueOnce('Gemini');
    const instance = Settings.getInstance();
    expect(instance.getDefaultLLMModel()).toBe(LLMEngineType.ChatGPT);

    const model = await instance.getCurrentLLMModel();
    expect(model).toBe(LLMEngineType.Gemini);
    expect(instance.getDefaultLLMModel()).toBe(LLMEngineType.Gemini);
  });

  it('loads boolean flags only once', async () => {
    enableConsensusMock.mockResolvedValueOnce(true);
    enableDarkThemeMock.mockResolvedValueOnce(true);

    const instance = Settings.getInstance();
    await instance.getEnableConsensus();
    await instance.getEnableConsensus();
    await instance.getEnableDarkTheme();
    await instance.getEnableDarkTheme();

    expect(enableConsensusMock).toHaveBeenCalledTimes(1);
    expect(enableDarkThemeMock).toHaveBeenCalledTimes(1);
  });

  it('retrieves consensus weights when consensus is enabled', async () => {
    enableConsensusMock.mockResolvedValueOnce(true);
    llmWeightsMock.mockResolvedValueOnce({
      [LLMEngineType.ChatGPT]: 0.6,
      [LLMEngineType.Gemini]: 0.4,
    });

    const instance = Settings.getInstance();
    const weights = await instance.getConsensusWeights();
    expect(weights).toEqual({
      [LLMEngineType.ChatGPT]: 0.6,
      [LLMEngineType.Gemini]: 0.4,
    });
  });
});

