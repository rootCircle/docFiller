import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';
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

browser.runtime.onInstalled.addListener(async () => {
  await MetricsManager.getInstance().getMetrics();
});

browser.runtime.onMessage.addListener(
  async (message: unknown, _sender: browser.Runtime.MessageSender) => {
    const typedMessage = message as ChromeResponseMessage | MagicPromptMessage;
    if (typedMessage.type === 'MAGIC_PROMPT_GEN') {
      const magicMessage = typedMessage as MagicPromptMessage;
      try {
        const instance = new LLMEngine(magicMessage.model);
        const response = await instance.invokeMagicLLM(magicMessage.questions);
        return { value: response };
      } catch (error: unknown) {
        // biome-ignore lint/suspicious/noConsole: debugging error in background script
        console.error('Error generating magic prompt:', error);
        if (error instanceof Error) {
          return { error: error.message };
        }
        return { error: String(error) };
      }
    }

    if (typedMessage.type === 'API_CALL') {
      const apiMessage = typedMessage as ChromeResponseMessage;
      try {
        const instance = new LLMEngine(apiMessage.model);
        const response = await instance.invokeLLM(
          apiMessage.prompt,
          apiMessage.questionType,
        );
        return { value: response };
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging error in background script
        console.error('Error getting response:', error);
        return {
          error: {
            message: error instanceof Error ? error.message : String(error),
            context: 'Failed to get response from LLMEngine',
          },
        };
      }
    }

    return undefined;
  },
);
