import { LLM_REQUIREMENTS, LLMEngineType } from '@utils/llmEngineTypes';
import { Settings } from '@utils/settings';
import {
  getAnthropicApiKey,
  getChatGptApiKey,
  getEnableConsensus,
  getGeminiApiKey,
  getLLMWeights,
  getMistralApiKey,
} from '@utils/storage/getProperties';

async function getApiKeys(): Promise<
  Record<LLMEngineType, string | undefined>
> {
  return {
    [LLMEngineType.ChatGPT]: await getChatGptApiKey(),
    [LLMEngineType.Gemini]: await getGeminiApiKey(),
    [LLMEngineType.Mistral]: await getMistralApiKey(),
    [LLMEngineType.Anthropic]: await getAnthropicApiKey(),
    [LLMEngineType.Ollama]: undefined,
    [LLMEngineType.ChromeAI]: undefined,
  };
}

/*
Logic :
Engine is  invalid if: For any engine (weights > 0 and no API key is present(but required))
so maintain 3 things for each engine: apipresent , apirequired , weight.
if there exist any engine for which `apirequired^(~apipresent) and weight>0` then that engine is invalid.
If consensus is enabled, then check for all engines, else check for the current model only.
*/

async function validateLLMConfiguration(): Promise<{
  isConsensusEnabled: boolean;
  invalidEngines: LLMEngineType[];
}> {
  const isConsensusEnabled = (await getEnableConsensus()) ?? false;
  const apiKeys = await getApiKeys();
  const invalidEngines: LLMEngineType[] = [];

  if (!isConsensusEnabled) {
    const settings = Settings.getInstance();
    const currentModel = await settings.getCurrentLLMModel();
    if (
      LLM_REQUIREMENTS[currentModel].requiresApiKey &&
      !apiKeys[currentModel]
    ) {
      invalidEngines.push(currentModel);
    }
  } else {
    const weights = await getLLMWeights();
    if (weights) {
      Object.entries(weights).forEach(([llmType, weight]) => {
        const engineType = llmType as LLMEngineType;
        if (
          LLM_REQUIREMENTS[engineType].requiresApiKey &&
          !apiKeys[engineType] &&
          weight > 0
        ) {
          invalidEngines.push(engineType);
        }
      });
    }
  }

  return {
    isConsensusEnabled,
    invalidEngines,
  };
}

export { validateLLMConfiguration };
