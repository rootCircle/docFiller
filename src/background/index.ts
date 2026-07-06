import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';
import { setupLongLivedPortListener } from '@utils/portMessage';
import browser from 'webextension-polyfill';

interface ChromeResponseMessage {
  type: string;
  prompt: string;
  model: LLMEngineType;
  questionType: QType;
}
interface MagicPromptMessage {
  type: 'MAGIC_PROMPT_GEN';
  questions: string[];
  model: LLMEngineType;
}

// Singleton cache to avoid re-initializing LLMEngine on every request
const llmEngineCache = new Map<LLMEngineType, LLMEngine>();

function getLLMEngine(model: LLMEngineType): LLMEngine {
  if (!llmEngineCache.has(model)) {
    llmEngineCache.set(model, new LLMEngine(model));
  }
  return llmEngineCache.get(model) as LLMEngine;
}

browser.runtime.onInstalled.addListener(async () => {
  await MetricsManager.getInstance().getMetrics();
});

// Long-lived port connection for API_CALL and MAGIC_PROMPT_GEN — prevents channel timeout for slow LLMs
setupLongLivedPortListener('llm-api-call', async (message: unknown) => {
  const typedMessage = message as ChromeResponseMessage | MagicPromptMessage;

  if (typedMessage.type === 'MAGIC_PROMPT_GEN') {
    const magicMessage = typedMessage as MagicPromptMessage;
    const instance = getLLMEngine(magicMessage.model);
    return await instance.invokeMagicLLM(magicMessage.questions);
  }

  if (typedMessage.type === 'API_CALL') {
    const apiMessage = typedMessage as ChromeResponseMessage;
    const instance = getLLMEngine(apiMessage.model);
    return await instance.invokeLLM(apiMessage.prompt, apiMessage.questionType);
  }

  return undefined;
});
