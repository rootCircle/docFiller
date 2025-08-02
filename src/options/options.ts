import { LLMEngineType, getModelName } from '@utils/llmEngineTypes';
import { safeGetElementById, ifElementExists } from '@utils/domUtils';
import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import {
  getSkipMarkedSetting,
  getSleepDuration,
  getLLMModel,
  getEnableConsensus,
  getEnableDarkTheme,
  getLLMWeights,
  getChatGptApiKey,
  getGeminiApiKey,
  getMistralApiKey,
  getAnthropicApiKey,
} from '@utils/storage/getProperties';
import {
  setToggleSkipMarkedStatus,
  setSleepDuration,
  setLLMModel,
  setEnableConsensus,
  setEnableDarkTheme,
  setLLMWeights,
  setChatGptApiKey,
  setGeminiApiKey,
  setMistralApiKey,
  setAnthropicApiKey,
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
  const metricsUI = new MetricsUI();
  await metricsUI.initialize();

  window.addEventListener('unload', () => {
    metricsUI.cleanup();
    ConsensusEngine.dispose();
  });

  const skipMarkedToggleButton = document.getElementById(
    'skipMarkedToggleButton',
  );
  if (!skipMarkedToggleButton) {
    return;
  }
  const initialState = await getSkipMarkedSetting();
  skipMarkedToggleButton.classList.toggle('active', initialState);

  skipMarkedToggleButton.addEventListener('click', async () => {
    await setToggleSkipMarkedStatus().catch((error) => {
      // biome-ignore lint/suspicious/noConsole: debugging options functionality
      console.error('Error toggling state:', error);
    });
    const currentState = await getSkipMarkedSetting();
    skipMarkedToggleButton.classList.toggle('active', currentState);
  });
  const modalHTML = `
    <div id="addProfileModal" class="modal hidden">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Add New Profile</h2>
        <form id="addProfileForm" autocomplete="off">
          <div class="form-group">
            <label for="profileName">Name</label>
            <input type="text" id="profileName" required>
          </div>
          <div class="form-group">
            <label for="profileImage">Image URL</label>
            <input type="url" id="profileImage" type="url" autocomplete="off" placeholder="https://w.wallhaven.cc/full/5g/wallhaven-5gxvv3.png" value="https://w.wallhaven.cc/full/5g/wallhaven-5gxvv3.png" >
          </div>
          <div class="form-group">
            <label for="profilePrompt">Prompt</label>
            <textarea id="profilePrompt" required></textarea>
          </div>
          <div class="form-group">
            <label for="profileShortDescription">Short Description</label>
            <input type="text" id="profileShortDescription" required>
          </div>
          <div class="form-actions">
            <button type="submit">Save Profile</button>
            <button type="button" class="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  try {
    await createProfileCards();
    const modal = document.getElementById('addProfileModal');
    const closeButton = modal?.querySelector('.close-button');
    const cancelButton = modal?.querySelector('.cancel-button');
    const addProfileForm = document.getElementById('addProfileForm');

    closeButton?.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('hidden');
      }
    });

    cancelButton?.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('hidden');
      }
    });

    addProfileForm?.addEventListener('submit', handleProfileFormSubmit);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: debugging options functionality
    console.error('Error initializing options:', error);
  }

  const sleepDurationInput = document.getElementById(
    'sleepDuration',
  ) as HTMLInputElement;
  const llmModelSelect = document.getElementById(
    'llmModel',
  ) as HTMLSelectElement;
  const enableConsensusCheckbox = document.getElementById(
    'enableConsensus',
  ) as HTMLInputElement;
  const enableDarkThemeCheckbox = document.getElementById(
    'enableDarkTheme',
  ) as HTMLInputElement;
  const consensusWeightsDiv = document.getElementById(
    'consensusWeights',
  ) as HTMLDivElement;
  const weightChatGPTInput = document.getElementById(
    'weightChatGPT',
  ) as HTMLInputElement;
  const weightGeminiInput = document.getElementById(
    'weightGemini',
  ) as HTMLInputElement;
  const weightOllamaInput = document.getElementById(
    'weightOllama',
  ) as HTMLInputElement;
  const weightChromeAIInput = document.getElementById(
    'weightChromeAI',
  ) as HTMLInputElement;
  const weightMistralInput = document.getElementById(
    'weightMistral',
  ) as HTMLInputElement;
  const weightAnthropicInput = document.getElementById(
    'weightAnthropic',
  ) as HTMLInputElement;
  const chatGptApiKeyInput = document.getElementById(
    'chatGptApiKey',
  ) as HTMLInputElement;
  const geminiApiKeyInput = document.getElementById(
    'geminiApiKey',
  ) as HTMLInputElement;
  const mistralApiKeyInput = document.getElementById(
    'mistralApiKey',
  ) as HTMLInputElement;
  const anthropicApiKeyInput = document.getElementById(
    'anthropicApiKey',
  ) as HTMLInputElement;
  const saveButton = safeGetElementById<HTMLButtonElement>('saveButton');
  const singleApiKeyInput =
    safeGetElementById<HTMLInputElement>('singleApiKey');
  const modelSelect = safeGetElementById<HTMLSelectElement>('llmModel');
  const apiKeyInputLink =
    safeGetElementById<HTMLAnchorElement>('singleApiKeyLink');

  initializeOptionPasswordField();

  // Safe event listener setup for model select
  if (modelSelect && apiKeyInputLink) {
    modelSelect.addEventListener('change', () => {
      updateApiKeyLink(modelSelect, apiKeyInputLink);
    });
  }

  enableConsensusCheckbox.addEventListener('change', () => {
    updateConsensusApiLinks(enableConsensusCheckbox);
  });

  // Load settings using centralized getter functions
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
      ]);

      sleepDurationInput.value = String(sleepDuration);
      llmModelSelect.value = llmModel;

      if (singleApiKeyInput) {
        updateApiKeyInputField(singleApiKeyInput, llmModelSelect);
      }
      enableConsensusCheckbox.checked = enableConsensus;
      enableDarkThemeCheckbox.checked = enableDarkTheme;

      weightChatGPTInput.value = String(llmWeights[LLMEngineType.ChatGPT]);
      weightGeminiInput.value = String(llmWeights[LLMEngineType.Gemini]);
      weightOllamaInput.value = String(llmWeights[LLMEngineType.Ollama]);
      weightChromeAIInput.value = String(llmWeights[LLMEngineType.ChromeAI]);
      weightMistralInput.value = String(llmWeights[LLMEngineType.Mistral]);
      weightAnthropicInput.value = String(llmWeights[LLMEngineType.Anthropic]);

      chatGptApiKeyInput.value = chatGptApiKey;
      geminiApiKeyInput.value = geminiApiKey;
      mistralApiKeyInput.value = mistralApiKey;
      anthropicApiKeyInput.value = anthropicApiKey;

      toggleConsensusOptions(enableConsensusCheckbox.checked);
      toggleDarkTheme(enableDarkThemeCheckbox.checked);

      // Initial call to set up the form when it loads
      if (modelSelect && apiKeyInputLink) {
        updateApiKeyLink(modelSelect, apiKeyInputLink);
      }
      updateConsensusApiLinks(enableConsensusCheckbox);
      updateSingleApiKeyInput(llmModelSelect.value);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging options functionality
      console.error('Error loading settings:', error);
      showToast('Error loading settings. Using defaults.', 'error');
    }
  };

  // Load settings on page load
  void loadSettings();

  llmModelSelect.addEventListener('change', () => {
    const apiKeyInput = document.getElementById(
      'singleApiKey',
    ) as HTMLInputElement;

    updateApiKeyInputField(apiKeyInput, llmModelSelect);

    updateSingleApiKeyInput(llmModelSelect.value);
  });

  const toggleDarkTheme = (enableDarkTheme: boolean) => {
    if (enableDarkTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const toggleConsensusOptions = (enableConsensus: boolean) => {
    if (enableConsensus) {
      consensusWeightsDiv.classList.remove('hidden');
      document.querySelector('label[for="llmModel"]')?.classList.add('hidden');
      document
        .querySelector('label[for="singleApiKey"]')
        ?.classList.add('hidden');
      llmModelSelect.parentElement?.classList.add('hidden');
      singleApiKeyInput?.parentElement?.classList.add('hidden');
    } else {
      consensusWeightsDiv.classList.add('hidden');
      document
        .querySelector('label[for="llmModel"]')
        ?.classList.remove('hidden');
      document
        .querySelector('label[for="singleApiKey"]')
        ?.classList.remove('hidden');
      llmModelSelect.parentElement?.classList.remove('hidden');
      singleApiKeyInput?.parentElement?.classList.remove('hidden');
    }
  };

  const updateSingleApiKeyInput = (selectedModel: string) => {
    let apiKeyValue = '';

    switch (selectedModel) {
      case getModelName(LLMEngineType.ChatGPT):
        apiKeyValue = chatGptApiKeyInput.value;
        break;
      case getModelName(LLMEngineType.Gemini):
        apiKeyValue = geminiApiKeyInput.value;
        break;
      case getModelName(LLMEngineType.Ollama):
      case getModelName(LLMEngineType.ChromeAI):
        apiKeyValue = '';
        break;
      case getModelName(LLMEngineType.Mistral):
        apiKeyValue = mistralApiKeyInput.value;
        break;
      case getModelName(LLMEngineType.Anthropic):
        apiKeyValue = anthropicApiKeyInput.value;
        break;
      default:
        // biome-ignore lint/suspicious/noConsole: debugging options functionality
        console.warn('Unknown model selected:', selectedModel);
        break;
    }

    if (singleApiKeyInput) {
      singleApiKeyInput.value = apiKeyValue;
    }
  };

  if (singleApiKeyInput) {
    singleApiKeyInput.addEventListener('input', () => {
      const selectedModel = llmModelSelect.value;
      const apiKeyValue = singleApiKeyInput.value;

      switch (selectedModel) {
        case getModelName(LLMEngineType.ChatGPT):
          chatGptApiKeyInput.value = apiKeyValue;
          break;
        case getModelName(LLMEngineType.Gemini):
          geminiApiKeyInput.value = apiKeyValue;
          break;
        case getModelName(LLMEngineType.Ollama):
        case getModelName(LLMEngineType.ChromeAI):
          break;
        case getModelName(LLMEngineType.Mistral):
          mistralApiKeyInput.value = apiKeyValue;
          break;
        case getModelName(LLMEngineType.Anthropic):
          anthropicApiKeyInput.value = apiKeyValue;
          break;
        default:
          // biome-ignore lint/suspicious/noConsole: debugging options functionality
          console.warn('Unknown model selected:', selectedModel);
          break;
      }
    });
  }

  enableConsensusCheckbox.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    toggleConsensusOptions(target.checked);
  });

  llmModelSelect.addEventListener('change', () => {
    updateSingleApiKeyInput(llmModelSelect.value);
  });

  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const saveOptions = async () => {
        const sleepDuration = Number.parseInt(sleepDurationInput.value, 10);
        const llmModel = llmModelSelect.value;
        const enableConsensus = enableConsensusCheckbox.checked;
        const enableDarkTheme = enableDarkThemeCheckbox.checked;
        const chatGptApiKey = chatGptApiKeyInput.value;
        const geminiApiKey = geminiApiKeyInput.value;
        const mistralApiKey = mistralApiKeyInput.value;
        const anthropicApiKey = anthropicApiKeyInput.value;

        const llmWeights = {
          [LLMEngineType.ChatGPT]: Number.parseFloat(weightChatGPTInput.value),
          [LLMEngineType.Gemini]: Number.parseFloat(weightGeminiInput.value),
          [LLMEngineType.Ollama]: Number.parseFloat(weightOllamaInput.value),
          [LLMEngineType.ChromeAI]: Number.parseFloat(
            weightChromeAIInput.value,
          ),
          [LLMEngineType.Mistral]: Number.parseFloat(weightMistralInput.value),
          [LLMEngineType.Anthropic]: Number.parseFloat(
            weightAnthropicInput.value,
          ),
        };

        try {
          // Save all settings using centralized setter functions
          await Promise.all([
            setSleepDuration(sleepDuration),
            setLLMModel(llmModel),
            setEnableConsensus(enableConsensus),
            setEnableDarkTheme(enableDarkTheme),
            setLLMWeights(llmWeights),
            setChatGptApiKey(chatGptApiKey),
            setGeminiApiKey(geminiApiKey),
            setMistralApiKey(mistralApiKey),
            setAnthropicApiKey(anthropicApiKey),
          ]);

          showToast('Settings saved successfully!', 'success');
        } catch (error) {
          showToast(
            `Error saving options. Please try again. ${error instanceof Error ? error.message : String(error)}`,
            'error',
          );
        }
      };

      void saveOptions();
    });
  }
});

// Settings related event listeners - Using safe DOM access
ifElementExists<HTMLInputElement>('enableConsensus', (enableConsensusEl) => {
  enableConsensusEl.addEventListener('change', function () {
    const consensusWeights = safeGetElementById('consensusWeights');
    const singleModelOptions = safeGetElementById('singleModelOptions');
    if (this.checked) {
      consensusWeights?.classList.remove('hidden');
      singleModelOptions?.classList.add('hidden');
    } else {
      consensusWeights?.classList.add('hidden');
      singleModelOptions?.classList.remove('hidden');
    }
  });
});

ifElementExists<HTMLInputElement>('enableDarkTheme', (enableDarkThemeEl) => {
  enableDarkThemeEl.addEventListener('change', function () {
    if (this.checked) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  });
});
