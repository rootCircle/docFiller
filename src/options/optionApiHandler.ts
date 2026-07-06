import {
  getAPIPlatformSourceLink,
  getModelName,
  getModelTypeFromName,
  LLMEngineType,
} from '@utils/llmEngineTypes';

function updateApiKeyLink(
  modelSelect: HTMLSelectElement,
  apiKeyInputLink: HTMLAnchorElement,
): void {
  const selectedModel = modelSelect.value;
  const selectedModelType = getModelTypeFromName(selectedModel);

  if (!selectedModelType) {
    return;
  }

  const warningMessage = document.querySelector(
    '.warning-message',
  ) as HTMLElement;

  const apiLink = getAPIPlatformSourceLink(selectedModelType);
  if (apiLink === '') {
    apiKeyInputLink.classList.add('hidden');
    warningMessage.classList.remove('hidden');
    warningMessage.style.display = 'block'; // keeping inline just in case
  } else {
    apiKeyInputLink.href = apiLink;
    apiKeyInputLink.textContent = 'Get API Key';
    apiKeyInputLink.classList.remove('hidden');
    warningMessage.classList.add('hidden');
    warningMessage.style.display = 'none'; // keeping inline just in case
  }
}

function updateConsensusApiLinks(
  enableConsensusCheckbox: HTMLInputElement,
): void {
  const consensusSection = document.getElementById(
    'consensusWeights',
  ) as HTMLElement;

  if (enableConsensusCheckbox.checked) {
    consensusSection.classList.remove('hidden');

    updateConsensusApiLink(
      'chatGptApiKey',
      getModelName(LLMEngineType.ChatGPT),
    );
    updateConsensusApiLink('geminiApiKey', getModelName(LLMEngineType.Gemini));
    updateConsensusApiLink(
      'mistralApiKey',
      getModelName(LLMEngineType.Mistral),
    );
    updateConsensusApiLink(
      'anthropicApiKey',
      getModelName(LLMEngineType.Anthropic),
    );
  } else {
    consensusSection.classList.add('hidden');
  }
}

function updateConsensusApiLink(apiKeyElementId: string, modelName: string) {
  const apiKeyInput = document.getElementById(
    apiKeyElementId,
  ) as HTMLInputElement;
  const modelDetected = getModelTypeFromName(modelName);
  if (!modelDetected) {
    return;
  }
  const apiLink = getAPIPlatformSourceLink(modelDetected);
  const apiLinkElement = apiKeyInput.parentElement
    ?.nextElementSibling as HTMLAnchorElement;

  if (apiLink) {
    apiKeyInput.disabled = false;
    apiLinkElement.href = apiLink;
    (apiKeyInput.nextElementSibling as HTMLElement).style.display = 'block';
    apiLinkElement.style.display = 'block';
  }
}

function updateApiKeyInputField(
  apiKeyInput: HTMLInputElement,
  llmModelSelect: HTMLSelectElement,
) {
  const apiKeyContainer = apiKeyInput.parentElement;
  const passwordToggleButton = apiKeyContainer?.querySelector(
    '.password-toggle',
  ) as HTMLButtonElement;
  if (
    llmModelSelect.value === getModelName(LLMEngineType.Ollama) ||
    llmModelSelect.value === getModelName(LLMEngineType.ChromeAI)
  ) {
    apiKeyInput.disabled = true;
    apiKeyInput.placeholder =
      llmModelSelect.value === getModelName(LLMEngineType.Ollama)
        ? 'No API key required for Ollama! Ensure Ollama is installed locally on your system.'
        : 'No API key required for Chrome AI';
    apiKeyContainer?.classList.add('warning');
    passwordToggleButton?.classList.add('hidden');
    apiKeyInput.value = '';
  } else {
    apiKeyInput.disabled = false;
    apiKeyInput.placeholder = '';
    apiKeyContainer?.classList.remove('warning');
    passwordToggleButton?.classList.remove('hidden');
  }

  const singleOllamaModelContainer = document.getElementById(
    'singleOllamaModelContainer',
  );
  if (llmModelSelect.value === getModelName(LLMEngineType.Ollama)) {
    singleOllamaModelContainer?.classList.remove('hidden');
  } else {
    singleOllamaModelContainer?.classList.add('hidden');
  }
}

export {
  updateConsensusApiLink,
  updateApiKeyLink,
  updateConsensusApiLinks,
  updateApiKeyInputField,
};
