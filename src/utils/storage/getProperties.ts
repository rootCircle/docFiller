import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { type LLMEngineType, getModelName } from '@utils/llmEngineTypes';
import { EMPTY_STRING } from '@utils/settings';

function getSetting<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(items[key] as T);
      }
    });
  });
}

async function getSleepDuration(): Promise<number> {
  return (
    (await getSetting<number>('sleepDuration')) ??
    DEFAULT_PROPERTIES.sleep_duration
  );
}

async function getLLMModel(): Promise<string> {
  return (
    (await getSetting<string>('llmModel')) ??
    getModelName(DEFAULT_PROPERTIES.model)
  );
}

async function getSkipMarkedSetting(): Promise<boolean> {
  const value = await getSetting<boolean>('skipMarkedQuestions');
  return value ?? DEFAULT_PROPERTIES.skipMarkedQuestions;
}

export async function getEnableOpacityOnSkippedQuestions(): Promise<boolean> {
  const value = await getSetting<boolean>('enableOpacityOnSkippedQuestions');
  return value ?? DEFAULT_PROPERTIES.enableOpacityOnSkippedQuestions;
}

async function getSkipMarkedStatus(): Promise<boolean> {
  return (
    (await getSetting<boolean>('skipMarkedQuestions')) ??
    DEFAULT_PROPERTIES.skipMarkedQuestions
  );
}

async function getEnableConsensus(): Promise<boolean> {
  return (
    (await getSetting<boolean>('enableConsensus')) ??
    DEFAULT_PROPERTIES.enableConsensus
  );
}

async function getEnableDarkTheme(): Promise<boolean> {
  return (
    (await getSetting<boolean>('enableDarkTheme')) ??
    DEFAULT_PROPERTIES.enableDarkTheme
  );
}

async function getLLMWeights(): Promise<Record<LLMEngineType, number>> {
  return (
    (await getSetting<Record<LLMEngineType, number>>('llmWeights')) ??
    DEFAULT_PROPERTIES.llmWeights
  );
}
async function getChatGptApiKey(): Promise<string> {
  return (await getSetting<string>('chatGptApiKey')) ?? EMPTY_STRING;
}

async function getGeminiApiKey(): Promise<string> {
  return (await getSetting<string>('geminiApiKey')) ?? EMPTY_STRING;
}

async function getMistralApiKey(): Promise<string> {
  return (await getSetting<string>('mistralApiKey')) ?? EMPTY_STRING;
}

async function getAnthropicApiKey(): Promise<string> {
  return (await getSetting<string>('anthropicApiKey')) ?? EMPTY_STRING;
}
async function getIsEnabled(): Promise<boolean> {
  return (
    (await getSetting<boolean>('automaticFillingEnabled')) ??
    DEFAULT_PROPERTIES.automaticFillingEnabled
  );
}
 async function getEnableResponseCaching(): Promise<boolean> {
  return (
    (await getSetting<boolean>('enableResponseCaching')) ??
    DEFAULT_PROPERTIES.enableResponseCaching
  );
}

 async function getResponseCacheMaxAge(): Promise<number> {
  return (
    (await getSetting<number>('responseCacheMaxAge')) ??
    DEFAULT_PROPERTIES.responseCacheMaxAge
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
  getSkipMarkedStatus,
  getEnableResponseCaching,
  getResponseCacheMaxAge
};
