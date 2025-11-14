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

// Helper function to store extension ID for testing
async function storeExtensionIdForTesting() {
  try {
    await browser.storage.local.set({
      __test_extension_id: browser.runtime.id
    });
  } catch (e) {
    // Silently fail if storage isn't available
  }
}

browser.runtime.onInstalled.addListener(async () => {
  await MetricsManager.getInstance().getMetrics();
  await storeExtensionIdForTesting();
});

// Also store ID when service worker starts (not just on install)
// This ensures tests can always find the ID
browser.runtime.onStartup.addListener(async () => {
  await storeExtensionIdForTesting();
});

// Store immediately on load for first-time testing
storeExtensionIdForTesting();

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
