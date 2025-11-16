import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runDocFillerEngine } from '@docFillerCore/index';
import { LLMEngineType } from '@utils/llmEngineTypes';
import { QType } from '@utils/questionTypes';

const questions: HTMLElement[] = [];
const detectTypeMock = vi.fn();
const getFieldsMock = vi.fn();
const getPromptMock = vi.fn();
const validateMock = vi.fn();
const fillMock = vi.fn();
const markedCheckMock = vi.fn();
const generateAndValidateMock = vi.fn();
const llmGetResponseMock = vi.fn();
const sendMessageMock = vi.fn();

vi.mock('@docFillerCore/engines/questionExtractorEngine', () => ({
  QuestionExtractorEngine: class {
    getValidQuestions() {
      return questions;
    }
  },
}));

vi.mock('@docFillerCore/detectors/detectBoxType', () => ({
  DetectBoxType: class {
    detectType = detectTypeMock;
  },
}));

vi.mock('@docFillerCore/engines/fieldExtractorEngine', () => ({
  FieldExtractorEngine: class {
    getFields = getFieldsMock;
  },
}));

vi.mock('@docFillerCore/engines/promptEngine', () => ({
  PromptEngine: class {
    getPrompt = getPromptMock;
  },
}));

vi.mock('@docFillerCore/engines/validatorEngine', () => ({
  ValidatorEngine: class {
    validate = validateMock;
  },
}));

vi.mock('@docFillerCore/engines/fillerEngine', () => ({
  FillerEngine: class {
    fill = fillMock;
  },
}));

vi.mock('@docFillerCore/engines/prefilledChecker', () => ({
  PrefilledChecker: class {
    markedCheck = markedCheckMock;
  },
}));

vi.mock('@docFillerCore/engines/consensusEngine', () => ({
  ConsensusEngine: {
    getInstance: vi.fn(async () => ({
      generateAndValidate: generateAndValidateMock,
      clearEnginePool: vi.fn(),
    })),
    dispose: vi.fn(),
  },
}));

vi.mock('@docFillerCore/engines/gptEngine', () => ({
  LLMEngine: class {
    public engine = LLMEngineType.ChatGPT;
    getResponse = llmGetResponseMock;
  },
}));

vi.mock('@utils/missingApiKey', () => ({
  validateLLMConfiguration: vi.fn(async () => ({
    invalidEngines: [],
    isConsensusEnabled: false,
  })),
}));

const getSkipMarkedSettingMock = vi.fn();
const getEnableOpacityMock = vi.fn();
vi.mock('@utils/storage/getProperties', () => ({
  getSkipMarkedSetting: (...args: unknown[]) =>
    getSkipMarkedSettingMock(...args),
  getEnableOpacityOnSkippedQuestions: (...args: unknown[]) =>
    getEnableOpacityMock(...args),
  getSelectedProfileKey: vi.fn(async () => 'default'),
}));

const setStorageItemMock = vi.fn();
const getStorageItemMock = vi.fn(async () => ({}));
vi.mock('@utils/storage/storageHelper', () => ({
  getStorageItem: (...args: unknown[]) => getStorageItemMock(...args),
  setStorageItem: (...args: unknown[]) => setStorageItemMock(...args),
}));

vi.mock('@utils/storage/profiles/profileManager', () => {
  const loadProfiles = vi.fn(async () => ({
    default: {
      system_prompt: 'Prompt',
      name: 'Profile',
      is_magic: false,
    },
  }));

  return {
    getSelectedProfileKey: vi.fn(async () => 'default'),
    loadProfiles,
  };
});

import { loadProfiles } from '@utils/storage/profiles/profileManager';

const metricsManagerMock = {
  incrementTotalQuestions: vi.fn(),
  incrementSuccessfulQuestions: vi.fn(),
  incrementToBeFilledQuestions: vi.fn(),
  startFormFilling: vi.fn(),
  endFormFilling: vi.fn(),
};
vi.mock('@utils/storage/metricsManager', () => ({
  MetricsManager: {
    getInstance: vi.fn(() => metricsManagerMock),
  },
}));

const settingsMock = {
  getEnableConsensus: vi.fn(async () => false),
  getCurrentLLMModel: vi.fn(async () => LLMEngineType.ChatGPT),
};
vi.mock('@utils/settings', () => ({
  Settings: {
    getInstance: vi.fn(() => settingsMock),
  },
}));

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    defaultProfile: {
      system_prompt: 'Default prompt',
    },
  },
}));

describe('runDocFillerEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    questions.length = 0;
    sendMessageMock.mockResolvedValue({});
    (globalThis.browser.runtime.sendMessage as unknown) = sendMessageMock;

    const question = document.createElement('div');
    questions.push(question);
    detectTypeMock.mockReturnValue(QType.TEXT);
    getFieldsMock.mockReturnValue({
      title: 'Question 1',
      description: '',
    });
    getPromptMock.mockReturnValue('Prompt');
    validateMock.mockReturnValue(true);
    fillMock.mockResolvedValue(true);
    markedCheckMock.mockReturnValue(false);
    llmGetResponseMock.mockResolvedValue({ text: 'result' });
    generateAndValidateMock.mockResolvedValue({ text: 'result' });
    getSkipMarkedSettingMock.mockResolvedValue(false);
    getEnableOpacityMock.mockResolvedValue(false);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('invokes single LLM engine when consensus is disabled', async () => {
    settingsMock.getEnableConsensus.mockResolvedValueOnce(false);

    await runDocFillerEngine();

    expect(llmGetResponseMock).toHaveBeenCalledWith(
      'Prompt',
      QType.TEXT,
      LLMEngineType.ChatGPT,
    );
    expect(generateAndValidateMock).not.toHaveBeenCalled();
    expect(fillMock).toHaveBeenCalled();
  });

  it('uses consensus engine when consensus is enabled', async () => {
    settingsMock.getEnableConsensus.mockResolvedValueOnce(true);
    generateAndValidateMock.mockResolvedValueOnce({ text: 'consensus' });

    await runDocFillerEngine();

    expect(generateAndValidateMock).toHaveBeenCalled();
    expect(llmGetResponseMock).not.toHaveBeenCalled();
    expect(fillMock).toHaveBeenCalled();
  });

  it('skips already filled questions and sets opacity when configured', async () => {
    markedCheckMock.mockReturnValue(true);
    getSkipMarkedSettingMock.mockResolvedValueOnce(true);
    getEnableOpacityMock.mockResolvedValueOnce(true);
    const questionElement = questions[0];

    await runDocFillerEngine();

    expect(fillMock).not.toHaveBeenCalled();
    expect(questionElement.style.opacity).toBe('0.6');
  });

  it('requests magic prompt for magic profiles and persists response', async () => {
    (loadProfiles as unknown as vi.Mock).mockResolvedValueOnce({
      default: { is_magic: true, system_prompt: 'Magic prompt' },
    });
    sendMessageMock.mockResolvedValueOnce({
      value: { system_prompt: 'Generated prompt' },
    });

    await runDocFillerEngine();

    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MAGIC_PROMPT_GEN' }),
    );
    expect(setStorageItemMock).toHaveBeenCalled();
  });
});
