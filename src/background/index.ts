import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';

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

chrome.runtime.onInstalled.addListener(async () => {
  await MetricsManager.getInstance().getMetrics();
});

chrome.runtime.onMessage.addListener(
  (
    message: ChromeResponseMessage | MagicPromptMessage,
    _sender,
    sendResponse,
  ) => {
    if (message.type === 'MAGIC_PROMPT_GEN') {
      const magicMessage = message as MagicPromptMessage;
      try {
        const instance = new LLMEngine(magicMessage.model);
        instance
          .invokeMagicLLM(magicMessage.questions)
          .then((response) => {
            sendResponse({ value: response });
          })
          .catch((error: unknown) => {
            // biome-ignore lint/suspicious/noConsole: debugging error in background script
            console.error('Error generating magic prompt:', error);
            if (error instanceof Error) {
              sendResponse({ error: error.message });
            } else {
              sendResponse({ error: String(error) });
            }
          });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging error in background script
        console.error('Error creating LLMEngine instance:', error);
        sendResponse({ error: String(error) });
      }
      return true;
    }

    if (message.type === 'API_CALL') {
      const apiMessage = message as ChromeResponseMessage;
      try {
        const instance = new LLMEngine(apiMessage.model);
        instance
          .invokeLLM(apiMessage.prompt, apiMessage.questionType)
          .then((response) => {
            sendResponse({ value: response });
          })
          .catch((error) => {
            // biome-ignore lint/suspicious/noConsole: debugging error in background script
            console.error('Error getting response:', error);
            sendResponse({
              error: {
                message: error instanceof Error ? error.message : String(error),
                context: 'Failed to get response from LLMEngine',
                // stack: error instanceof Error ? error.stack : undefined
              },
            });
          });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging error in background script
        console.error('Error creating LLMEngine instance:', error);
        sendResponse({
          error: {
            message: error instanceof Error ? error.message : String(error),
            context: 'Failed to create LLMEngine instance',
            // stack: error instanceof Error ? error.stack : undefined
          },
        });
      }
      return true;
    }

    return false;
  },
);
