import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';
import { clearOldResponses } from '@utils/storage/responseCache';
import { getResponseCacheMaxAge } from '@utils/storage/getProperties';

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

// Set up the alarm when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  await MetricsManager.getInstance().getMetrics();

  // Set up an alarm to clear old responses periodically (every 6 hours)
  chrome.alarms.create('clearOldResponsesAlarm', {
    periodInMinutes: 360, // 6 hours
  });

  // Also run it once on install/update
  const maxAge = await getResponseCacheMaxAge();
  await clearOldResponses(maxAge);
});

// Handle the alarm event to clean up old responses
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'clearOldResponsesAlarm') {
    // biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Running scheduled cleanup of old responses');
    const maxAge = await getResponseCacheMaxAge();
    await clearOldResponses(maxAge);
  }
});

chrome.runtime.onMessage.addListener(
  (message: MagicPromptMessage, _sender, sendResponse) => {
    if (message.type === 'MAGIC_PROMPT_GEN') {
      try {
        const instance = new LLMEngine(message.model);
        instance
          .invokeMagicLLM(message.questions)
          .then((response) => {
            sendResponse({ value: response });
          })
          .catch((error: unknown) => {
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.error('Error generating magic prompt:', error);
            if (error instanceof Error) {
              sendResponse({ error: error.message });
            } else {
              sendResponse({ error: String(error) });
            }
          });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error('Error creating LLMEngine instance:', error);
        sendResponse({ error: String(error) });
      }
      return true;
    }
    return false;
  },
);

chrome.runtime.onMessage.addListener(
  (message: ChromeResponseMessage, _sender, sendResponse) => {
    if (message.type === 'API_CALL') {
      try {
        const instance = new LLMEngine(message.model);
        instance
          .invokeLLM(message.prompt, message.questionType)
          .then((response) => {
            sendResponse({ value: response });
          })
          .catch((error) => {
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.error('Error getting response:', error);
          });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error('Error creating LLMEngine instance:', error);
      }
      return true;
    }
    return false;
  },
);
