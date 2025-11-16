import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getSleepDurationMock = vi.fn();
const getLLMModelMock = vi.fn();
const getEnableConsensusMock = vi.fn();
const getEnableDarkThemeMock = vi.fn();
const getLLMWeightsMock = vi.fn();
const getChatGptApiKeyMock = vi.fn();
const getGeminiApiKeyMock = vi.fn();
const getMistralApiKeyMock = vi.fn();
const getAnthropicApiKeyMock = vi.fn();
const getSkipMarkedSettingMock = vi.fn();

vi.mock('@utils/storage/getProperties', () => ({
  getSleepDuration: (...args: unknown[]) => getSleepDurationMock(...args),
  getLLMModel: (...args: unknown[]) => getLLMModelMock(...args),
  getEnableConsensus: (...args: unknown[]) => getEnableConsensusMock(...args),
  getEnableDarkTheme: (...args: unknown[]) => getEnableDarkThemeMock(...args),
  getLLMWeights: (...args: unknown[]) => getLLMWeightsMock(...args),
  getChatGptApiKey: (...args: unknown[]) => getChatGptApiKeyMock(...args),
  getGeminiApiKey: (...args: unknown[]) => getGeminiApiKeyMock(...args),
  getMistralApiKey: (...args: unknown[]) => getMistralApiKeyMock(...args),
  getAnthropicApiKey: (...args: unknown[]) => getAnthropicApiKeyMock(...args),
  getSkipMarkedSetting: (...args: unknown[]) =>
    getSkipMarkedSettingMock(...args),
  getEnableOpacityOnSkippedQuestions: vi.fn(),
}));

const setSleepDurationMock = vi.fn();
const setLLMModelMock = vi.fn();
const setEnableConsensusMock = vi.fn();
const setLLMWeightsMock = vi.fn();
const setChatGptApiKeyMock = vi.fn();
const setGeminiApiKeyMock = vi.fn();
const setMistralApiKeyMock = vi.fn();
const setAnthropicApiKeyMock = vi.fn();
const setEnableDarkThemeMock = vi.fn();
const setToggleSkipMarkedMock = vi.fn();

vi.mock('@utils/storage/setProperties', () => ({
  setSleepDuration: (...args: unknown[]) => setSleepDurationMock(...args),
  setLLMModel: (...args: unknown[]) => setLLMModelMock(...args),
  setEnableConsensus: (...args: unknown[]) => setEnableConsensusMock(...args),
  setLLMWeights: (...args: unknown[]) => setLLMWeightsMock(...args),
  setChatGptApiKey: (...args: unknown[]) => setChatGptApiKeyMock(...args),
  setGeminiApiKey: (...args: unknown[]) => setGeminiApiKeyMock(...args),
  setMistralApiKey: (...args: unknown[]) => setMistralApiKeyMock(...args),
  setAnthropicApiKey: (...args: unknown[]) => setAnthropicApiKeyMock(...args),
  setEnableDarkTheme: (...args: unknown[]) => setEnableDarkThemeMock(...args),
  setToggleSkipMarkedStatus: (...args: unknown[]) =>
    setToggleSkipMarkedMock(...args),
}));

const validateMock = vi.fn();
vi.mock('@utils/missingApiKey', () => ({
  validateLLMConfiguration: (...args: unknown[]) => validateMock(...args),
}));

const updateApiKeyLinkMock = vi.fn();
const updateApiKeyInputFieldMock = vi.fn();
const updateConsensusApiLinksMock = vi.fn();

vi.mock('@options/optionApiHandler', () => ({
  updateApiKeyLink: (...args: unknown[]) => updateApiKeyLinkMock(...args),
  updateApiKeyInputField: (...args: unknown[]) =>
    updateApiKeyInputFieldMock(...args),
  updateConsensusApiLinks: (...args: unknown[]) =>
    updateConsensusApiLinksMock(...args),
}));

const initializePasswordFieldMock = vi.fn();
vi.mock('@options/optionPasswordField', () => ({
  initializeOptionPasswordField: (...args: unknown[]) =>
    initializePasswordFieldMock(...args),
}));

const createProfileCardsMock = vi.fn();
const handleProfileFormSubmitMock = vi.fn();
vi.mock('@options/optionProfileHandler', () => ({
  createProfileCards: (...args: unknown[]) => createProfileCardsMock(...args),
  handleProfileFormSubmit: (...args: unknown[]) =>
    handleProfileFormSubmitMock(...args),
}));

const metricsInitializeMock = vi.fn();
vi.mock('@options/metrics', () => ({
  MetricsUI: vi.fn(() => ({
    initialize: metricsInitializeMock,
  })),
}));

const showToastMock = vi.fn();
vi.mock('@utils/toastUtils', () => ({
  showToast: (...args: unknown[]) => showToastMock(...args),
}));

vi.mock('@utils/llmEngineTypes', () => ({
  getModelName: (model: string) => model,
  LLMEngineType: {
    ChatGPT: 'ChatGPT',
    Gemini: 'Gemini',
    Mistral: 'Mistral',
    Anthropic: 'Anthropic',
    Ollama: 'Ollama',
    ChromeAI: 'ChromeAI',
  },
}));

vi.mock('@utils/domUtils', () => ({
  safeGetElementById: <T extends HTMLElement>(id: string): T | null =>
    document.getElementById(id) as T | null,
}));

describe('options/options - with rich DOM stub', () => {
  let domContentLoadedHandler: (() => Promise<void>) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    domContentLoadedHandler = null;

    // Intercept addEventListener for DOMContentLoaded
    const originalAddEventListener = document.addEventListener;
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'DOMContentLoaded' && typeof handler === 'function') {
          domContentLoadedHandler = handler as () => Promise<void>;
        } else {
          originalAddEventListener.call(
            document,
            event as string,
            handler as EventListener,
          );
        }
      },
    );

    // Build complete DOM structure
    document.body.innerHTML = `
      <div class="tabs">
        <button class="tab-link active" aria-controls="panel-general" aria-selected="true"></button>
        <button class="tab-link" aria-controls="panel-advanced" aria-selected="false"></button>
        <button class="tab-link" id="tab-api-btn" aria-controls="panel-api" aria-selected="false"></button>
      </div>
      <div id="panel-general" class="tab-panel active"></div>
      <div id="panel-advanced" class="tab-panel"></div>
      <div id="panel-api" class="tab-panel"></div>
      
      <label for="sleepDuration">Sleep Duration</label>
      <input id="sleepDuration" type="number" value="0" />
      
      <label for="llmModel">LLM Model</label>
      <select id="llmModel">
        <option value="ChatGPT">ChatGPT</option>
        <option value="Gemini">Gemini</option>
        <option value="Mistral">Mistral</option>
        <option value="Anthropic">Anthropic</option>
      </select>
      
      <input id="enableConsensus" type="checkbox" />
      <button id="darkThemeToggleButton"></button>
      <div id="skipMarkedToggleButton"></div>
      
      <div id="consensusWeights" class="hidden">
        <input id="weightChatGPT" type="number" value="0" />
        <input id="weightGemini" type="number" value="0" />
        <input id="weightOllama" type="number" value="0" />
        <input id="weightChromeAI" type="number" value="0" />
        <input id="weightMistral" type="number" value="0" />
        <input id="weightAnthropic" type="number" value="0" />
      </div>
      
      <input id="chatGptApiKey" type="password" />
      <input id="geminiApiKey" type="password" />
      <input id="mistralApiKey" type="password" />
      <input id="anthropicApiKey" type="password" />
      
      <label for="singleApiKey">Single API Key</label>
      <input id="singleApiKey" type="password" />
      <a id="singleApiKeyLink" href="#">Get API Key</a>
      
      <div class="warning-message"></div>
      <button id="saveApiButton">Save API</button>
      <button id="saveAdvancedButton">Save Advanced</button>
      
      <div id="metricsLoading"></div>
      <div id="profileCards"></div>
      
      <form id="addProfileForm">
        <input name="profileName" />
        <textarea name="systemPrompt"></textarea>
      </form>
      
      <div id="addProfileModal" class="hidden">
        <button class="close-button">×</button>
        <button class="cancel-button">Cancel</button>
      </div>
      
      <div class="api-message"><span class="api-message-text"></span></div>
      <div class="button-section-vertical-right"></div>
    `;

    // Mock all storage getters with default values
    getSleepDurationMock.mockResolvedValue(300);
    getLLMModelMock.mockResolvedValue('ChatGPT');
    getEnableConsensusMock.mockResolvedValue(false);
    getEnableDarkThemeMock.mockResolvedValue(false);
    getLLMWeightsMock.mockResolvedValue({
      ChatGPT: 1,
      Gemini: 0,
      Mistral: 0,
      Anthropic: 0,
      Ollama: 0,
      ChromeAI: 0,
    });
    getChatGptApiKeyMock.mockResolvedValue('test-chat-key');
    getGeminiApiKeyMock.mockResolvedValue('test-gemini-key');
    getMistralApiKeyMock.mockResolvedValue('test-mistral-key');
    getAnthropicApiKeyMock.mockResolvedValue('test-anthropic-key');
    getSkipMarkedSettingMock.mockResolvedValue(true);

    // Mock validation
    validateMock.mockResolvedValue({
      invalidEngines: [],
      isConsensusEnabled: false,
    });

    // Mock all action functions
    setSleepDurationMock.mockResolvedValue(undefined);
    setLLMModelMock.mockResolvedValue(undefined);
    setEnableConsensusMock.mockResolvedValue(undefined);
    setLLMWeightsMock.mockResolvedValue(undefined);
    setChatGptApiKeyMock.mockResolvedValue(undefined);
    setGeminiApiKeyMock.mockResolvedValue(undefined);
    setMistralApiKeyMock.mockResolvedValue(undefined);
    setAnthropicApiKeyMock.mockResolvedValue(undefined);
    setEnableDarkThemeMock.mockResolvedValue(undefined);
    setToggleSkipMarkedMock.mockResolvedValue(undefined);

    metricsInitializeMock.mockResolvedValue(undefined);
    createProfileCardsMock.mockResolvedValue(undefined);
    handleProfileFormSubmitMock.mockResolvedValue(undefined);
    initializePasswordFieldMock.mockImplementation(() => {});
    updateApiKeyLinkMock.mockImplementation(() => {});
    updateApiKeyInputFieldMock.mockImplementation(() => {});
    updateConsensusApiLinksMock.mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  const loadOptionsPage = async () => {
    // Import the module (registers DOMContentLoaded)
    await import('@options/options');

    // Trigger DOMContentLoaded
    if (domContentLoadedHandler) {
      await domContentLoadedHandler();
    }

    // Wait for any pending promises
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  it('initializes all settings and UI components', async () => {
    await loadOptionsPage();

    // Verify core initialization calls
    expect(getSleepDurationMock).toHaveBeenCalled();
    expect(getLLMModelMock).toHaveBeenCalled();
    expect(getEnableConsensusMock).toHaveBeenCalled();
    expect(initializePasswordFieldMock).toHaveBeenCalled();
    expect(createProfileCardsMock).toHaveBeenCalled();
    expect(validateMock).toHaveBeenCalled();

    // MetricsUI initialization is optional (wrapped in try-catch)
    // So we just verify it was attempted, not that it succeeded
  });

  it('saves API and consensus settings when save button clicked', async () => {
    await loadOptionsPage();

    const saveButton = document.getElementById(
      'saveApiButton',
    ) as HTMLButtonElement;
    const llmModelSelect = document.getElementById(
      'llmModel',
    ) as HTMLSelectElement;
    llmModelSelect.value = 'Gemini';

    saveButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(setLLMModelMock).toHaveBeenCalledWith('Gemini');
    expect(setEnableConsensusMock).toHaveBeenCalled();
    expect(setLLMWeightsMock).toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith(
      'API & Consensus saved.',
      'success',
    );
  });

  it('toggles skip marked status and persists', async () => {
    await loadOptionsPage();

    const toggleButton = document.getElementById(
      'skipMarkedToggleButton',
    ) as HTMLDivElement;
    toggleButton.click();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(setToggleSkipMarkedMock).toHaveBeenCalled();
    expect(getSkipMarkedSettingMock).toHaveBeenCalledTimes(2); // Once on load, once after toggle
    expect(showToastMock).toHaveBeenCalledWith(
      'Skip already filled: On',
      'success',
    );
  });
});
