import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { LLMEngineType } from '@utils/llmEngineTypes';
import { QType } from '@utils/questionTypes';

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    llmWeights: {
      'gpt-4.1-mini': 0.5,
      'gemini-2.5-flash-lite': 0.3,
      'qwen3:4b': 0,
      'mistral-large-latest': 0.2,
      'claude-4-sonnet-latest': 0,
      'chrome-gemini-nano': 0,
    },
  },
}));

const analyzeWeightedObjectsMock = vi.fn(() => ({ text: 'winner' }));

vi.mock('@utils/consensusUtil', () => ({
  analyzeWeightedObjects: (...args: unknown[]) =>
    analyzeWeightedObjectsMock(...args),
}));

const validateMock = vi.fn();

vi.mock('@docFillerCore/engines/validatorEngine', () => ({
  ValidatorEngine: class {
    validate(
      fieldType: QType,
      extractedValue: ExtractedValue,
      response: LLMResponse,
    ) {
      return validateMock(fieldType, extractedValue, response);
    }
  },
}));

const llmResponseMap = new Map<LLMEngineType, unknown | null>();

const llmConstructorMock = vi.fn((engineType: LLMEngineType) => ({
  engine: engineType,
  getResponse: vi.fn(async () => llmResponseMap.get(engineType) ?? null),
}));

vi.mock('@docFillerCore/engines/gptEngine', () => ({
  LLMEngine: class {
    public engine: LLMEngineType;

    constructor(engineType: LLMEngineType) {
      this.engine = engineType;
      llmConstructorMock(engineType);
    }

    async getResponse(
      prompt: string,
      fieldType: QType,
      engineType: LLMEngineType,
    ) {
      return llmResponseMap.get(engineType) ?? null;
    }
  },
}));

const settingsWeightsMock = vi.fn(async () => ({
  'gpt-4.1-mini': 0.5,
  'gemini-2.5-flash-lite': 0.3,
  'qwen3:4b': 0,
  'mistral-large-latest': 0.2,
  'claude-4-sonnet-latest': 0,
  'chrome-gemini-nano': 0,
}));

vi.mock('@utils/settings', () => ({
  Settings: {
    getInstance: vi.fn(() => ({
      getConsensusWeights: settingsWeightsMock,
      getEnableConsensus: vi.fn(async () => true),
      getCurrentLLMModel: vi.fn(async () => LLMEngineType.ChatGPT),
    })),
  },
}));

describe('ConsensusEngine', () => {
  beforeEach(() => {
    llmConstructorMock.mockClear();
    llmResponseMap.clear();
    analyzeWeightedObjectsMock.mockClear();
    validateMock.mockReset();
  });

  afterEach(() => {
    ConsensusEngine.dispose();
    vi.clearAllMocks();
  });

  it('normalizes weights fetched from settings before generating responses', async () => {
    settingsWeightsMock.mockResolvedValueOnce({
      [LLMEngineType.ChatGPT]: 2,
      [LLMEngineType.Gemini]: 0,
      [LLMEngineType.Ollama]: 0,
      [LLMEngineType.Mistral]: 0,
      [LLMEngineType.Anthropic]: 0,
      [LLMEngineType.ChromeAI]: 0,
    });
    llmResponseMap.set(LLMEngineType.ChatGPT, { text: 'sample' });
    validateMock.mockReturnValue(true);

    const engine = await ConsensusEngine.getInstance();
    const result = await engine.generateAndValidate(
      'prompt',
      { title: 'Question?' } as any,
      QType.TEXT,
    );

    expect(result).toEqual({ text: 'winner' });
    expect(analyzeWeightedObjectsMock).toHaveBeenCalledTimes(1);
    const [[responses]] = analyzeWeightedObjectsMock.mock.calls;
    expect(responses).toHaveLength(1);
    expect(responses[0]?.weight).toBeCloseTo(1);
  });

  it('reuses LLM engine instances across invocations', async () => {
    llmResponseMap.set(LLMEngineType.ChatGPT, { text: 'ok' });
    llmResponseMap.set(LLMEngineType.Mistral, { text: 'also ok' });
    validateMock.mockReturnValue(true);

    const engine = await ConsensusEngine.getInstance();
    expect(engine.getPoolSize()).toBe(0);

    await engine.generateAndValidate(
      'prompt',
      { title: '' } as any,
      QType.TEXT,
    );
    expect(engine.getPoolSize()).toBeGreaterThan(0);
    const poolSizeAfterFirstCall = engine.getPoolSize();
    await engine.generateAndValidate(
      'prompt2',
      { title: '' } as any,
      QType.TEXT,
    );
    expect(engine.getPoolSize()).toBe(poolSizeAfterFirstCall);

    expect(llmConstructorMock).toHaveBeenCalledTimes(poolSizeAfterFirstCall);
  });

  it('skips engines with zero weight and filters invalid responses', async () => {
    llmResponseMap.set(LLMEngineType.ChatGPT, { text: 'valid' });
    llmResponseMap.set(LLMEngineType.Gemini, { text: 'ignored' });
    validateMock.mockImplementation((_qType, _value, response) => {
      return response === llmResponseMap.get(LLMEngineType.ChatGPT);
    });

    const engine = await ConsensusEngine.getInstance();
    const result = await engine.generateAndValidate(
      'prompt',
      { title: 'Foo' } as any,
      QType.TEXT,
    );

    expect(result).toEqual({ text: 'winner' });
    expect(analyzeWeightedObjectsMock).toHaveBeenCalledWith([
      expect.objectContaining({
        source: LLMEngineType.ChatGPT,
        value: llmResponseMap.get(LLMEngineType.ChatGPT),
      }),
    ]);
  });

  it('clears cached engines when clearEnginePool is called', async () => {
    llmResponseMap.set(LLMEngineType.ChatGPT, { text: 'value' });
    validateMock.mockReturnValue(true);
    const engine = await ConsensusEngine.getInstance();

    await engine.generateAndValidate(
      'prompt',
      { title: '' } as any,
      QType.TEXT,
    );
    expect(engine.getPoolSize()).toBeGreaterThan(0);

    engine.clearEnginePool();
    expect(engine.getPoolSize()).toBe(0);
  });
});
