import { EMPTY_STRING } from '@utils/settings';

enum LLMEngineType {
  ChatGPT = 'gpt-4.1-mini',
  Gemini = 'gemini-2.5-flash-lite',
  Ollama = 'qwen3:4b',
  Anthropic = 'claude-4-sonnet-latest',
  Mistral = 'mistral-large-latest',
  ChromeAI = 'chrome-gemini-nano',
}

interface LLMRequirements {
  requiresApiKey: boolean;
}

const LLM_REQUIREMENTS: Record<LLMEngineType, LLMRequirements> = {
  [LLMEngineType.ChatGPT]: { requiresApiKey: true },
  [LLMEngineType.Gemini]: { requiresApiKey: true },
  [LLMEngineType.Ollama]: { requiresApiKey: false },
  [LLMEngineType.Mistral]: { requiresApiKey: true },
  [LLMEngineType.Anthropic]: { requiresApiKey: true },
  [LLMEngineType.ChromeAI]: { requiresApiKey: false },
};

function getModelName(modelType: LLMEngineType): string {
  switch (modelType) {
    case LLMEngineType.ChatGPT:
      return 'ChatGPT';
    case LLMEngineType.Gemini:
      return 'Gemini';
    case LLMEngineType.Ollama:
      return 'Ollama';
    case LLMEngineType.Anthropic:
      return 'Anthropic';
    case LLMEngineType.Mistral:
      return 'Mistral';
    case LLMEngineType.ChromeAI:
      return 'ChromeAI';
  }
}

function getModelTypeFromName(modelName: string): LLMEngineType | null {
  switch (modelName) {
    case 'ChatGPT':
      return LLMEngineType.ChatGPT;
    case 'Gemini':
      return LLMEngineType.Gemini;
    case 'Ollama':
      return LLMEngineType.Ollama;
    case 'ChromeAI':
      return LLMEngineType.ChromeAI;
    case 'Mistral':
      return LLMEngineType.Mistral;
    case 'Anthropic':
      return LLMEngineType.Anthropic;
  }

  return null;
}

function getAPIPlatformSourceLink(modelType: LLMEngineType): string {
  switch (modelType) {
    case LLMEngineType.ChatGPT:
      return 'https://platform.openai.com/settings/organization/api-keys';
    case LLMEngineType.Gemini:
      return 'https://makersuite.google.com/app/apikey';
    case LLMEngineType.Ollama:
    case LLMEngineType.ChromeAI:
      return EMPTY_STRING; // ChromeAI, Ollama doesn't need an API key link
    case LLMEngineType.Mistral:
      return 'https://console.mistral.ai/api-keys/';
    case LLMEngineType.Anthropic:
      return 'https://console.anthropic.com/settings/keys';
  }
}

export {
  LLMEngineType,
  getModelName,
  getModelTypeFromName,
  getAPIPlatformSourceLink,
  LLM_REQUIREMENTS,
};
