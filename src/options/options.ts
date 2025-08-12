import { safeGetElementById } from '@utils/domUtils';
import { getModelName, LLMEngineType } from '@utils/llmEngineTypes';
import { validateLLMConfiguration } from '@utils/missingApiKey';
import {
  getAnthropicApiKey,
  getChatGptApiKey,
  getEnableConsensus,
  getEnableDarkTheme,
  getGeminiApiKey,
  getLLMModel,
  getLLMWeights,
  getMistralApiKey,
  getSkipMarkedSetting,
  getSleepDuration,
} from '@utils/storage/getProperties';
import {
  setAnthropicApiKey,
  setChatGptApiKey,
  setEnableConsensus,
  setEnableDarkTheme,
  setGeminiApiKey,
  setLLMModel,
  setLLMWeights,
  setMistralApiKey,
  setSleepDuration,
  setToggleSkipMarkedStatus,
} from '@utils/storage/setProperties';
import { showToast } from '@utils/toastUtils';
import { MetricsUI } from './metrics';
import {
  updateApiKeyInputField,
  updateApiKeyLink,
  updateConsensusApiLinks,
} from './optionApiHandler';
import { initializeOptionPasswordField } from './optionPasswordField';
import {
  createProfileCards,
  handleProfileFormSubmit,
} from './optionProfileHandler';

document.addEventListener('DOMContentLoaded', async () => {
  // Tabs: show one panel at a time with keyboard navigation
  const tabLinks = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.tab-link'),
  );
  const tabPanels = Array.from(
    document.querySelectorAll<HTMLElement>('.tab-panel'),
  );

  const activateTab = (tab: HTMLButtonElement) => {
    tabLinks.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const controls = tab.getAttribute('aria-controls');
    tabPanels.forEach((p) => p.classList.remove('active'));
    if (controls) {
      const panel = document.getElementById(controls);
      panel?.classList.add('active');
    }
  };

  tabLinks.forEach((tab, idx) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx = (idx + dir + tabLinks.length) % tabLinks.length;
        tabLinks[nextIdx]?.focus();
      }
    });
  });
  // Ensure one tab is active on load
  const initiallyActive = tabLinks.find((t) => t.classList.contains('active'));
  if (!initiallyActive && tabLinks[0]) activateTab(tabLinks[0]);

  // DOM references (nullable and guarded)
  const sleepDurationInput =
    safeGetElementById<HTMLInputElement>('sleepDuration');
  const llmModelSelect = safeGetElementById<HTMLSelectElement>('llmModel');
  const enableConsensusCheckbox =
    safeGetElementById<HTMLInputElement>('enableConsensus');
  const darkThemeToggleButton = safeGetElementById<HTMLButtonElement>(
    'darkThemeToggleButton',
  );
  const skipMarkedToggleButton = safeGetElementById<HTMLDivElement>(
    'skipMarkedToggleButton',
  );
  const consensusWeightsDiv =
    safeGetElementById<HTMLDivElement>('consensusWeights');
  const weightChatGPTInput =
    safeGetElementById<HTMLInputElement>('weightChatGPT');
  const weightGeminiInput =
    safeGetElementById<HTMLInputElement>('weightGemini');
  const weightOllamaInput =
    safeGetElementById<HTMLInputElement>('weightOllama');
  const weightChromeAIInput =
    safeGetElementById<HTMLInputElement>('weightChromeAI');
  const weightMistralInput =
    safeGetElementById<HTMLInputElement>('weightMistral');
  const weightAnthropicInput =
    safeGetElementById<HTMLInputElement>('weightAnthropic');
  const chatGptApiKeyInput =
    safeGetElementById<HTMLInputElement>('chatGptApiKey');
  const geminiApiKeyInput =
    safeGetElementById<HTMLInputElement>('geminiApiKey');
  const mistralApiKeyInput =
    safeGetElementById<HTMLInputElement>('mistralApiKey');
  const anthropicApiKeyInput =
    safeGetElementById<HTMLInputElement>('anthropicApiKey');
  const singleApiKeyInput =
    safeGetElementById<HTMLInputElement>('singleApiKey');
  const apiKeyInputLink =
    safeGetElementById<HTMLAnchorElement>('singleApiKeyLink');
  const saveApiButton = safeGetElementById<HTMLButtonElement>('saveApiButton');
  const saveAdvancedButton =
    safeGetElementById<HTMLButtonElement>('saveAdvancedButton');
  const apiTabButton = safeGetElementById<HTMLButtonElement>('tab-api-btn');

  // Debounce helper
  const debounce = <F extends (...args: unknown[]) => void>(
    fn: F,
    delay = 250,
  ) => {
    let t: number | undefined;
    return (...args: Parameters<F>) => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), delay);
    };
  };

  // Mark API tab if configuration is invalid
  type ValidationResult = {
    invalidEngines: string[];
    isConsensusEnabled: boolean;
  };
  const updateApiTabIndicator = async () => {
    try {
      const result = (await validateLLMConfiguration()) as ValidationResult;
      const hasIssues = result.invalidEngines.length > 0;
      apiTabButton?.classList.toggle('api-warning', hasIssues);
      if (apiTabButton) {
        apiTabButton.title = hasIssues
          ? `Missing/invalid API keys: ${result.invalidEngines.join(', ')}`
          : '';
      }
    } catch {
      // On unexpected failure, do not block UI; clear indicator
      apiTabButton?.classList.remove('api-warning');
    }
  };
  const updateApiTabIndicatorDebounced = debounce(updateApiTabIndicator, 300);

  // Utilities
  const toggleDarkTheme = (enable: boolean) => {
    darkThemeToggleButton?.classList.toggle('active', enable);
    document.documentElement.classList.toggle('dark-theme', enable);
  };

  const setSkipMarkedUI = (enable: boolean) => {
    skipMarkedToggleButton?.classList.toggle('active', enable);
  };

  const toggleConsensusOptions = (enable: boolean) => {
    if (enable) {
      consensusWeightsDiv?.classList.remove('hidden');
      document.querySelector('label[for="llmModel"]')?.classList.add('hidden');
      document
        .querySelector('label[for="singleApiKey"]')
        ?.classList.add('hidden');
      llmModelSelect?.parentElement?.classList.add('hidden');
      singleApiKeyInput?.parentElement?.classList.add('hidden');
    } else {
      consensusWeightsDiv?.classList.add('hidden');
      document
        .querySelector('label[for="llmModel"]')
        ?.classList.remove('hidden');
      document
        .querySelector('label[for="singleApiKey"]')
        ?.classList.remove('hidden');
      llmModelSelect?.parentElement?.classList.remove('hidden');
      singleApiKeyInput?.parentElement?.classList.remove('hidden');
    }
  };

  const updateSingleApiKeyFromModel = (selectedModel: string) => {
    let apiKeyValue = '';
    switch (selectedModel) {
      case getModelName(LLMEngineType.ChatGPT):
        apiKeyValue = chatGptApiKeyInput?.value ?? '';
        break;
      case getModelName(LLMEngineType.Gemini):
        apiKeyValue = geminiApiKeyInput?.value ?? '';
        break;
      case getModelName(LLMEngineType.Mistral):
        apiKeyValue = mistralApiKeyInput?.value ?? '';
        break;
      case getModelName(LLMEngineType.Anthropic):
        apiKeyValue = anthropicApiKeyInput?.value ?? '';
        break;
      case getModelName(LLMEngineType.Ollama):
      case getModelName(LLMEngineType.ChromeAI):
        apiKeyValue = '';
        break;
      default:
        break;
    }
    if (singleApiKeyInput) singleApiKeyInput.value = apiKeyValue;
  };

  // Initialize password field toggles
  initializeOptionPasswordField();

  // Event wiring
  if (llmModelSelect && apiKeyInputLink && singleApiKeyInput) {
    llmModelSelect.addEventListener('change', () => {
      updateApiKeyLink(llmModelSelect, apiKeyInputLink);
      updateApiKeyInputField(singleApiKeyInput, llmModelSelect);
      updateSingleApiKeyFromModel(llmModelSelect.value);
      void updateApiTabIndicatorDebounced();
    });
  }

  if (singleApiKeyInput && llmModelSelect) {
    singleApiKeyInput.addEventListener('input', () => {
      const selectedModel = llmModelSelect.value;
      const val = singleApiKeyInput.value;
      switch (selectedModel) {
        case getModelName(LLMEngineType.ChatGPT):
          if (chatGptApiKeyInput) chatGptApiKeyInput.value = val;
          break;
        case getModelName(LLMEngineType.Gemini):
          if (geminiApiKeyInput) geminiApiKeyInput.value = val;
          break;
        case getModelName(LLMEngineType.Mistral):
          if (mistralApiKeyInput) mistralApiKeyInput.value = val;
          break;
        case getModelName(LLMEngineType.Anthropic):
          if (anthropicApiKeyInput) anthropicApiKeyInput.value = val;
          break;
        default:
          break;
      }
      void updateApiTabIndicatorDebounced();
    });
  }

  if (enableConsensusCheckbox) {
    enableConsensusCheckbox.addEventListener('change', () => {
      updateConsensusApiLinks(enableConsensusCheckbox);
      toggleConsensusOptions(enableConsensusCheckbox.checked);
      void updateApiTabIndicatorDebounced();
    });
  }

  if (darkThemeToggleButton) {
    darkThemeToggleButton.addEventListener('click', async () => {
      const next = !document.documentElement.classList.contains('dark-theme');
      toggleDarkTheme(next);
      try {
        await setEnableDarkTheme(next);
      } catch (error) {
        showToast(
          `Failed to save theme. ${error instanceof Error ? error.message : String(error)}`,
          'error',
        );
      }
    });
  }

  if (skipMarkedToggleButton) {
    skipMarkedToggleButton.addEventListener('click', async () => {
      try {
        await setToggleSkipMarkedStatus();
        const current = await getSkipMarkedSetting();
        setSkipMarkedUI(current);
        showToast(`Skip already filled: ${current ? 'On' : 'Off'}`, 'success');
      } catch {
        showToast('Failed to update skip-filled setting.', 'error');
      }
    });
  }

  // When any individual API key or weight changes, re-validate
  chatGptApiKeyInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  geminiApiKeyInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  mistralApiKeyInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  anthropicApiKeyInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightChatGPTInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightGeminiInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightOllamaInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightChromeAIInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightMistralInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );
  weightAnthropicInput?.addEventListener(
    'input',
    () => void updateApiTabIndicatorDebounced(),
  );

  const saveApiAndConsensus = async () => {
    const llmModel = llmModelSelect ? llmModelSelect.value : '';
    const enableConsensus = enableConsensusCheckbox
      ? enableConsensusCheckbox.checked
      : false;
    const chatGptApiKey = chatGptApiKeyInput?.value ?? '';
    const geminiApiKey = geminiApiKeyInput?.value ?? '';
    const mistralApiKey = mistralApiKeyInput?.value ?? '';
    const anthropicApiKey = anthropicApiKeyInput?.value ?? '';

    const llmWeights: Record<LLMEngineType, number> = {
      [LLMEngineType.ChatGPT]: Number.parseFloat(
        weightChatGPTInput?.value ?? '0',
      ),
      [LLMEngineType.Gemini]: Number.parseFloat(
        weightGeminiInput?.value ?? '0',
      ),
      [LLMEngineType.Ollama]: Number.parseFloat(
        weightOllamaInput?.value ?? '0',
      ),
      [LLMEngineType.ChromeAI]: Number.parseFloat(
        weightChromeAIInput?.value ?? '0',
      ),
      [LLMEngineType.Mistral]: Number.parseFloat(
        weightMistralInput?.value ?? '0',
      ),
      [LLMEngineType.Anthropic]: Number.parseFloat(
        weightAnthropicInput?.value ?? '0',
      ),
    };

    await Promise.all([
      setLLMModel(llmModel),
      setEnableConsensus(enableConsensus),
      setLLMWeights(llmWeights),
      setChatGptApiKey(chatGptApiKey),
      setGeminiApiKey(geminiApiKey),
      setMistralApiKey(mistralApiKey),
      setAnthropicApiKey(anthropicApiKey),
    ]);
  };

  const saveAdvanced = async () => {
    const sleepDuration = sleepDurationInput
      ? Number.parseInt(sleepDurationInput.value, 10)
      : 0;
    const enableDarkTheme =
      document.documentElement.classList.contains('dark-theme');
    await Promise.all([
      setSleepDuration(sleepDuration),
      setEnableDarkTheme(enableDarkTheme),
    ]);
  };

  if (saveApiButton) {
    saveApiButton.addEventListener('click', async () => {
      try {
        await saveApiAndConsensus();
        showToast('API & Consensus saved.', 'success');
        void updateApiTabIndicator();
      } catch (error) {
        showToast(
          `Error saving API/Consensus. ${error instanceof Error ? error.message : String(error)}`,
          'error',
        );
      }
    });
  }

  if (saveAdvancedButton) {
    saveAdvancedButton.addEventListener('click', async () => {
      try {
        await saveAdvanced();
        showToast('Advanced settings saved.', 'success');
      } catch (error) {
        showToast(
          `Error saving advanced settings. ${error instanceof Error ? error.message : String(error)}`,
          'error',
        );
      }
    });
  }

  // Global save button removed from UI; keep a no-op guard if referenced.

  // Load settings and initialize UI
  const loadSettings = async () => {
    try {
      const [
        sleepDuration,
        llmModel,
        enableConsensus,
        enableDarkTheme,
        llmWeights,
        chatGptApiKey,
        geminiApiKey,
        mistralApiKey,
        anthropicApiKey,
        skipMarked,
      ] = await Promise.all([
        getSleepDuration(),
        getLLMModel(),
        getEnableConsensus(),
        getEnableDarkTheme(),
        getLLMWeights(),
        getChatGptApiKey(),
        getGeminiApiKey(),
        getMistralApiKey(),
        getAnthropicApiKey(),
        getSkipMarkedSetting(),
      ]);

      if (sleepDurationInput) sleepDurationInput.value = String(sleepDuration);
      if (llmModelSelect) llmModelSelect.value = llmModel;
      if (singleApiKeyInput && llmModelSelect) {
        updateApiKeyInputField(singleApiKeyInput, llmModelSelect);
        if (apiKeyInputLink) {
          updateApiKeyLink(llmModelSelect, apiKeyInputLink);
        }
        updateSingleApiKeyFromModel(llmModelSelect.value);
      }
      if (enableConsensusCheckbox)
        enableConsensusCheckbox.checked = enableConsensus;
      if (weightChatGPTInput)
        weightChatGPTInput.value = String(
          llmWeights[LLMEngineType.ChatGPT] ?? 0,
        );
      if (weightGeminiInput)
        weightGeminiInput.value = String(llmWeights[LLMEngineType.Gemini] ?? 0);
      if (weightOllamaInput)
        weightOllamaInput.value = String(llmWeights[LLMEngineType.Ollama] ?? 0);
      if (weightChromeAIInput)
        weightChromeAIInput.value = String(
          llmWeights[LLMEngineType.ChromeAI] ?? 0,
        );
      if (weightMistralInput)
        weightMistralInput.value = String(
          llmWeights[LLMEngineType.Mistral] ?? 0,
        );
      if (weightAnthropicInput)
        weightAnthropicInput.value = String(
          llmWeights[LLMEngineType.Anthropic] ?? 0,
        );
      if (chatGptApiKeyInput) chatGptApiKeyInput.value = chatGptApiKey;
      if (geminiApiKeyInput) geminiApiKeyInput.value = geminiApiKey;
      if (mistralApiKeyInput) mistralApiKeyInput.value = mistralApiKey;
      if (anthropicApiKeyInput) anthropicApiKeyInput.value = anthropicApiKey;

      toggleConsensusOptions(enableConsensus);
      toggleDarkTheme(enableDarkTheme);
      setSkipMarkedUI(skipMarked);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: helpful during options load
      console.error('Error loading settings:', error);
      showToast('Error loading settings. Using defaults.', 'error');
    }
  };

  await loadSettings();
  // Initial validation indicator
  await updateApiTabIndicator();

  // Initialize Metrics UI
  try {
    const metrics = new MetricsUI();
    await metrics.initialize();
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: optional metrics init
    console.warn('Metrics UI init skipped/failed:', e);
  }

  // Profiles: cards and form handler (if present)
  try {
    await createProfileCards();
    // Add Profile button removed from UI; modal opens from card edit/add flows only.

    const addProfileForm = document.getElementById('addProfileForm');
    if (addProfileForm) {
      addProfileForm.addEventListener('submit', (ev) => {
        void handleProfileFormSubmit(ev);
      });
    }

    // Modal close/cancel handlers
    const addProfileModal = document.getElementById('addProfileModal');
    const modalClose = addProfileModal?.querySelector('.close-button');
    const modalCancel = addProfileModal?.querySelector('.cancel-button');
    const hideModal = () => addProfileModal?.classList.add('hidden');
    if (modalClose) modalClose.addEventListener('click', hideModal);
    if (modalCancel) modalCancel.addEventListener('click', hideModal);
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: optional profiles init
    console.warn('Profiles init skipped/failed:', e);
  }
});
