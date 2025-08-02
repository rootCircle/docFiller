import { LLMEngineType } from '@utils/llmEngineTypes';

interface typeDefaultProperties {
  model: LLMEngineType;
  sleep_duration: number;
  enableConsensus: boolean;
  enableDarkTheme: boolean;
  llmWeights: Record<LLMEngineType, number>;
  automaticFillingEnabled: boolean;
  enableResponseCaching: boolean;
  responseCacheMaxAge: number;
  defaultProfileKey: string;
  defaultProfile: Profile;
  skipMarkedQuestions: boolean;
  enableOpacityOnSkippedQuestions: boolean;
}
const LLMWeightsMap = {
  [LLMEngineType.Gemini]: 0.18,
  [LLMEngineType.ChatGPT]: 0.26,
  [LLMEngineType.Anthropic]: 0.35,
  [LLMEngineType.Mistral]: 0.13,
  [LLMEngineType.Ollama]: 0.08,
  [LLMEngineType.ChromeAI]: 0.08,
};

const DEFAULT_PROPERTIES: typeDefaultProperties = {
  sleep_duration: 1500,
  model: LLMEngineType.Gemini,
  enableConsensus: false,
  enableDarkTheme: false,
  llmWeights: LLMWeightsMap,
  automaticFillingEnabled: true,
  enableResponseCaching: true,
  responseCacheMaxAge: 10 * 24 * 60 * 60 * 1000,
  defaultProfileKey: 'default',
  defaultProfile: {
    name: 'All Rounder',
    image_url:
      '/assets/profile/avatars/all_rounder.png',
    system_prompt:
      "You're  a smart and reliable assistant who adapts to any situation. Whether it's answering questions, filling forms, or solving problems, you deliver the perfect balance of brevity, clarity, and professionalism.",
    short_description: 'Your best all-rounder',
    is_custom: false,
  },
  skipMarkedQuestions: true,
  enableOpacityOnSkippedQuestions: true,
};

export { DEFAULT_PROPERTIES };
