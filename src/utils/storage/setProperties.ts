import type { LLMEngineType } from '@utils/llmEngineTypes';
import { getSkipMarkedSetting } from '@utils/storage/getProperties';
import { setStorageItem } from '@utils/storage/storageHelper';

// Individual setter functions
export async function setSleepDuration(value: number): Promise<void> {
  return await setStorageItem('sleepDuration', value);
}

export async function setLLMModel(value: string): Promise<void> {
  return await setStorageItem('llmModel', value);
}

export async function setSkipMarkedSetting(value: boolean): Promise<void> {
  return await setStorageItem('skipMarkedQuestions', value);
}

export async function setToggleSkipMarkedStatus(): Promise<void> {
  try {
    const currentState = await getSkipMarkedSetting();
    const newState = !currentState;
    await setStorageItem('skipMarkedQuestions', newState);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: debugging storage error
    console.error('Failed to toggle skip marked status:', error);
    throw error;
  }
}

export async function setEnableOpacityOnSkippedQuestions(
  value: boolean,
): Promise<void> {
  return await setStorageItem('enableOpacityOnSkippedQuestions', value);
}

export async function setEnableConsensus(value: boolean): Promise<void> {
  return await setStorageItem('enableConsensus', value);
}

export async function setEnableDarkTheme(value: boolean): Promise<void> {
  return await setStorageItem('enableDarkTheme', value);
}

export async function setLLMWeights(
  value: Record<LLMEngineType, number>,
): Promise<void> {
  return await setStorageItem('llmWeights', value);
}

export async function setChatGptApiKey(value: string): Promise<void> {
  return await setStorageItem('chatGptApiKey', value);
}

export async function setGeminiApiKey(value: string): Promise<void> {
  return await setStorageItem('geminiApiKey', value);
}

export async function setMistralApiKey(value: string): Promise<void> {
  return await setStorageItem('mistralApiKey', value);
}

export async function setAnthropicApiKey(value: string): Promise<void> {
  return await setStorageItem('anthropicApiKey', value);
}

export async function setIsEnabled(value: boolean): Promise<void> {
  return await setStorageItem('automaticFillingEnabled', value);
}
