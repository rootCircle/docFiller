import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { getModelName, type LLMEngineType } from '@utils/llmEngineTypes';
import { EMPTY_STRING } from '@utils/settings';
import { getStorageItem } from '@utils/storage/storageHelper';

async function getSleepDuration(): Promise<number> {
  return (
    (await getStorageItem<number>('sleepDuration')) ??
    DEFAULT_PROPERTIES.sleep_duration
  );
}

async function getLLMModel(): Promise<string> {
  return (
    (await getStorageItem<string>('llmModel')) ??
    getModelName(DEFAULT_PROPERTIES.model)
  );
}

async function getSkipMarkedSetting(): Promise<boolean> {
  const value = await getStorageItem<boolean>('skipMarkedQuestions');
  return value ?? DEFAULT_PROPERTIES.skipMarkedQuestions;
}

export async function getEnableOpacityOnSkippedQuestions(): Promise<boolean> {
  const value = await getStorageItem<boolean>(
    'enableOpacityOnSkippedQuestions',
  );
  return value ?? DEFAULT_PROPERTIES.enableOpacityOnSkippedQuestions;
}

async function getEnableConsensus(): Promise<boolean> {
  return (
    (await getStorageItem<boolean>('enableConsensus')) ??
    DEFAULT_PROPERTIES.enableConsensus
  );
}

async function getEnableDarkTheme(): Promise<boolean> {
  return (
    (await getStorageItem<boolean>('enableDarkTheme')) ??
    DEFAULT_PROPERTIES.enableDarkTheme
  );
}

async function getLLMWeights(): Promise<Record<LLMEngineType, number>> {
  return (
    (await getStorageItem<Record<LLMEngineType, number>>('llmWeights')) ??
    DEFAULT_PROPERTIES.llmWeights
  );
}
async function getChatGptApiKey(): Promise<string> {
  return (await getStorageItem<string>('chatGptApiKey')) ?? EMPTY_STRING;
}

async function getGeminiApiKey(): Promise<string> {
  return (await getStorageItem<string>('geminiApiKey')) ?? EMPTY_STRING;
}

async function getMistralApiKey(): Promise<string> {
  return (await getStorageItem<string>('mistralApiKey')) ?? EMPTY_STRING;
}

async function getAnthropicApiKey(): Promise<string> {
  return (await getStorageItem<string>('anthropicApiKey')) ?? EMPTY_STRING;
}
async function getIsEnabled(): Promise<boolean> {
  return (
    (await getStorageItem<boolean>('automaticFillingEnabled')) ??
    DEFAULT_PROPERTIES.automaticFillingEnabled
  );
}

export {
  getSleepDuration,
  getLLMModel,
  getEnableConsensus,
  getEnableDarkTheme,
  getLLMWeights,
  getChatGptApiKey,
  getGeminiApiKey,
  getMistralApiKey,
  getAnthropicApiKey,
  getIsEnabled,
  getSkipMarkedSetting,
};
