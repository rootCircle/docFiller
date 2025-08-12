import { LLMEngineType } from '@utils/llmEngineTypes';

interface typeDefaultProperties {
  model: LLMEngineType;
  sleep_duration: number;
  enableConsensus: boolean;
  enableDarkTheme: boolean;
  llmWeights: Record<LLMEngineType, number>;
  automaticFillingEnabled: boolean;
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
  enableDarkTheme: true,
  llmWeights: LLMWeightsMap,
  automaticFillingEnabled: true,
  defaultProfileKey: 'default',
  defaultProfile: {
    system_prompt: `You are a helpful assistant that writes like a real person.
Start right away with the answer. Use simple words. Keep sentences short. Use active voice. Sound natural and warm, not robotic. Use contractions like I'm, you're, we'll. Do not use em dashes or fancy symbols. Avoid lists unless the user asks. No emojis. No prefaces or disclaimers. Plain text only.
For each question give detailed answers without any introductory phrases like "Here is" or "Your answer is." Start directly with the content. Provide answers in plain text ONLY,
Style rules:
- Clear, human tone
- Short, direct sentences
- Simple vocabulary
- No em dashes (—), no bullet points unless requested

If you need to explain steps, do it in short lines separated by periods.`,
    image_url: '/assets/profile/avatars/default_placeholder.png',
    name: 'Human',
    short_description: 'Simple, natural and human-like',
    is_custom: false,
  },
  skipMarkedQuestions: true,
  enableOpacityOnSkippedQuestions: true,
};

export { DEFAULT_PROPERTIES };
