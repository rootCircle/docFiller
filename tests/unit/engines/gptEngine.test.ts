import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { LLMEngineType } from '@utils/llmEngineTypes';
import { QType } from '@utils/questionTypes';

const chatOpenAIMock = vi.fn();
const chatGeminiMock = vi.fn();
const chatOllamaMock = vi.fn();
const chatMistralMock = vi.fn();
const chatAnthropicMock = vi.fn();
const chromeAIMock = vi.fn();

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: class {
    constructor(config: unknown) {
      chatOpenAIMock(config);
    }
  },
}));
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: class {
    constructor(config: unknown) {
      chatGeminiMock(config);
    }
  },
}));
vi.mock('@langchain/ollama', () => ({
  ChatOllama: class {
    constructor(config: unknown) {
      chatOllamaMock(config);
    }
  },
}));
vi.mock('@langchain/mistralai', () => ({
  ChatMistralAI: class {
    constructor(config: unknown) {
      chatMistralMock(config);
    }
  },
}));
vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: class {
    constructor(config: unknown) {
      chatAnthropicMock(config);
    }
  },
}));
vi.mock('@langchain/community/experimental/llms/chrome_ai', () => ({
  ChromeAI: class {
    constructor(config: unknown) {
      chromeAIMock(config);
    }
  },
}));

function createParser(label: string) {
  return {
    getFormatInstructions: () => `FORMAT:${label}`,
  };
}

const structuredFromNames = vi.fn(() => createParser('names'));
const structuredFromZod = vi.fn(() => createParser('zod'));

vi.mock('@langchain/core/output_parsers', () => ({
  StructuredOutputParser: {
    fromNamesAndDescriptions: (...args: unknown[]) =>
      structuredFromNames(...args),
    fromZodSchema: (...args: unknown[]) => structuredFromZod(...args),
  },
  StringOutputParser: class {
    getFormatInstructions() {
      return 'FORMAT:string';
    }
  },
}));

const datetimeFormatMock = vi.fn(() => 'FORMAT:date');

vi.mock('langchain/output_parsers', () => ({
  DatetimeOutputParser: class {
    getFormatInstructions() {
      return datetimeFormatMock();
    }
  },
}));

const runnableInvokeMock = vi.fn();
vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn(() => ({
      invoke: (...args: unknown[]) => runnableInvokeMock(...args),
    })),
  },
}));

vi.mock('@langchain/core/prompts', () => ({
  ChatPromptTemplate: {
    fromMessages: vi.fn((messages) => ({ messages })),
  },
}));

const metricsAddResponseTime = vi.fn();
vi.mock('@utils/storage/metricsManager', () => ({
  MetricsManager: {
    getInstance: vi.fn(() => ({
      addResponseTime: metricsAddResponseTime,
    })),
  },
}));

vi.mock('@utils/storage/getProperties', () => ({
  getChatGptApiKey: vi.fn(async () => 'chatgpt-key'),
  getGeminiApiKey: vi.fn(async () => 'gemini-key'),
  getMistralApiKey: vi.fn(async () => 'mistral-key'),
  getAnthropicApiKey: vi.fn(async () => 'anthropic-key'),
  getSelectedProfileKey: vi.fn(async () => 'default'),
  getEnableDarkTheme: vi.fn(),
}));

vi.mock('@utils/storage/profiles/profileManager', () => ({
  loadProfiles: vi.fn(async () => ({
    default: {
      system_prompt: 'Profile Prompt',
      name: 'Profile',
      image_url: 'img.png',
      short_description: '',
    },
  })),
  getSelectedProfileKey: vi.fn(async () => 'default'),
}));

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    defaultProfile: {
      system_prompt: 'Default Prompt',
      image_url: 'default.png',
      name: 'Default',
      short_description: 'Default profile',
    },
  },
}));

const sendMessageMock = vi.fn();
beforeEach(() => {
  (globalThis.browser.runtime.sendMessage as unknown) = sendMessageMock;
});

describe('LLMEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runnableInvokeMock.mockResolvedValue('LLM_RESPONSE');
    sendMessageMock.mockResolvedValue({ value: { text: 'from background' } });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('instantiates ChatGPT engine with fetched API key', async () => {
    const engine = new LLMEngine(LLMEngineType.ChatGPT);
    await Promise.resolve();
    engine.instantiateEngine(LLMEngineType.ChatGPT);

    expect(chatOpenAIMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'chatgpt-key',
        model: 'gpt-4.1-mini',
      }),
    );
  });

  it('returns background response in getResponse and handles invalid payloads', async () => {
    const engine = new LLMEngine(LLMEngineType.ChatGPT);
    const response = await engine.getResponse(
      'prompt',
      QType.TEXT,
      LLMEngineType.ChatGPT,
    );
    expect(response).toEqual({ text: 'from background' });

    sendMessageMock.mockResolvedValueOnce({ error: 'Failure' });
    const errorResponse = await engine.getResponse(
      'prompt',
      QType.TEXT,
      LLMEngineType.ChatGPT,
    );
    expect(errorResponse).toBeNull();
  });

  it('invokeMagicLLM returns structured output from getMagicResponse', async () => {
    runnableInvokeMock.mockResolvedValueOnce({
      subject_context: 'Docs',
      expertise_level: 'Intermediate',
      system_prompt: 'Prompt',
    });
    const engine = new LLMEngine(LLMEngineType.ChatGPT);
    const result = await engine.invokeMagicLLM(['Question 1', 'Question 2']);

    expect(result).toEqual({
      subject_context: 'Docs',
      expertise_level: 'Intermediate',
      system_prompt: 'Prompt',
    });
  });

  it('invokeLLM uses parser instructions and records response time', async () => {
    runnableInvokeMock.mockResolvedValueOnce('AI answer');
    const engine = new LLMEngine(LLMEngineType.ChatGPT);
    const patched = await engine.invokeLLM('What is your name?', QType.TEXT);

    expect(patched).toEqual({ text: 'AI answer' });
    expect(metricsAddResponseTime).toHaveBeenCalled();
    expect(runnableInvokeMock).toHaveBeenCalledWith({
      question: 'What is your name?',
      format_instructions: 'FORMAT:string',
    });
  });

  it('patchResponse maps to expected structures', async () => {
    const engine = new LLMEngine(LLMEngineType.ChatGPT);
    const patch = engine['patchResponse'].bind(engine) as (
      value: unknown,
      type: QType,
    ) => LLMResponse;

    expect(patch('hello', QType.TEXT)).toEqual({ text: 'hello' });
    expect(patch(new Date(), QType.DATE)).toHaveProperty('date');
    expect(patch({ answer: 3 } as any, QType.LINEAR_SCALE_OR_STAR)).toEqual({
      linearScale: { answer: 3 },
    });
  });

  it('getParser returns appropriate parser types for different question types', () => {
    const engine = new LLMEngine(LLMEngineType.ChatGPT) as any;
    const stringParser = engine.getParser(QType.TEXT);
    expect(stringParser.getFormatInstructions()).toBe('FORMAT:string');

    const dateParser = engine.getParser(QType.DATE);
    expect(dateParser.getFormatInstructions()).toBe('FORMAT:date');

    engine.getParser(QType.DROPDOWN);
    expect(structuredFromNames).toHaveBeenCalled();
  });
});
