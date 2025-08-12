import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { safeQuerySelector } from '@utils/domUtils';
import { validateLLMConfiguration } from '@utils/missingApiKey';
import { getEnableDarkTheme, getIsEnabled } from '@utils/storage/getProperties';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';
import { setIsEnabled } from '@utils/storage/setProperties';
import { showToast } from '@utils/toastUtils';

document.addEventListener('DOMContentLoaded', async () => {
  let previousState = false;

  const toggleButton = document.getElementById('toggleButton');
  const toggleOn = toggleButton
    ? safeQuerySelector<HTMLElement>(toggleButton, '.toggle-on')
    : null;
  const toggleOff = toggleButton
    ? safeQuerySelector<HTMLElement>(toggleButton, '.toggle-off')
    : null;
  const fillSection = document.querySelector<HTMLElement>(
    '.button-section-vertical-right',
  );
  const refreshButton = document.querySelector<HTMLElement>(
    '.button-section-vertical-left',
  );
  const apiMessage = safeQuerySelector<HTMLElement>(document, '.api-message');
  const apiMessageText = apiMessage
    ? safeQuerySelector<HTMLElement>(apiMessage, '.api-message-text')
    : null;

  if (
    !toggleButton ||
    !toggleOn ||
    !toggleOff ||
    !refreshButton ||
    !fillSection ||
    !apiMessage ||
    !apiMessageText
  ) {
    // biome-ignore lint/suspicious/noConsole: debugging popup functionality
    console.error('Required elements not found');
    return;
  }

  function updateToggleState(isEnabled: boolean): void {
    if (toggleOn) {
      toggleOn.style.display = isEnabled ? 'block' : 'none';
    }
    if (toggleOff) {
      toggleOff.style.display = isEnabled ? 'none' : 'block';
    }
    if (fillSection) {
      fillSection.style.display = isEnabled ? 'none' : 'flex';
    }
  }

  try {
    const automaticFillingEnabled = await getIsEnabled();
    previousState = automaticFillingEnabled;
    updateToggleState(automaticFillingEnabled);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: debugging storage error in popup
    console.error('Error loading automatic filling state:', error);
    // Use default value if storage fails
    const automaticFillingEnabled = DEFAULT_PROPERTIES.automaticFillingEnabled;
    previousState = automaticFillingEnabled;
    updateToggleState(automaticFillingEnabled);
  }
  refreshButton.style.display = 'none';
  fillSection.style.display = 'none';
  async function checkAndUpdateApiMessage() {
    type ValidationResult = {
      invalidEngines: string[];
      isConsensusEnabled: boolean;
    };
    const validation = (await validateLLMConfiguration()) as ValidationResult;
    let multiple = '';
    if (validation.invalidEngines.length > 1) {
      multiple = 's';
    }
    if (validation.invalidEngines.length > 0) {
      if (apiMessage) {
        apiMessage.style.display = 'block';
      }
      if (validation.isConsensusEnabled) {
        if (apiMessageText) {
          apiMessageText.textContent = `Please add API keys in Options for the required model${multiple} (${validation.invalidEngines.join(', ')}) or set their weight${multiple} to 0 in consensus settings`;
        }
      } else {
        if (apiMessageText) {
          apiMessageText.textContent =
            'Please add an API key in Options to use DocFiller';
        }
      }
      toggleButton?.classList.add('disabled');

      if (toggleButton) {
        toggleButton.style.pointerEvents = 'none';
      }
    } else {
      if (apiMessage) {
        apiMessage.style.display = 'none';
      }
      toggleButton?.classList.remove('disabled');
      if (toggleButton) {
        toggleButton.style.pointerEvents = 'cursor';
      }
    }
  }
  toggleButton.addEventListener('click', () => {
    const saveState = async () => {
      try {
        const currentState = await getIsEnabled();
        const newState = !currentState;
        await setIsEnabled(newState);

        if (previousState !== newState) {
          refreshButton.style.display = 'flex';
        }
        previousState = newState;
        updateToggleState(newState);

        await checkAndUpdateApiMessage();
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging popup functionality
        console.error(
          `Error saving state. ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    void saveState();
  });

  fillSection.addEventListener('click', () => {
    showToast('Starting auto-fill process...', 'info');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url?.includes('docs.google.com/forms')) {
        showToast('Please open a Google Form to use auto-fill', 'error');
        return;
      }

      if (!tab.id) {
        showToast('Error: Could not get tab ID', 'error');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
        if (chrome.runtime.lastError) {
          showToast('Error: Could not communicate with page', 'error');
          return;
        }
        if (response?.success) {
          showToast('Auto-fill completed successfully!', 'success');
        } else {
          showToast(
            `Auto-fill failed: ${response?.error || 'Unknown error'}`,
            'error',
          );
        }
      });
    });
  });

  refreshButton.addEventListener('click', () => {
    chrome.tabs.reload().catch((error) => {
      // biome-ignore lint/suspicious/noConsole: debugging popup functionality
      console.error('Failed to reload tab:', error);
    });
  });

  async function setTheme() {
    const isDarkTheme = await getEnableDarkTheme();
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  async function fillProfile() {
    const imageUrlInput = safeQuerySelector<HTMLImageElement>(
      document,
      '.profile-avatar img',
    );
    const nameElement = safeQuerySelector<HTMLElement>(
      document,
      '.profile-name',
    );

    const selectedProfileKey = await getSelectedProfileKey();
    const profiles = await loadProfiles();

    if (imageUrlInput) {
      imageUrlInput.src =
        profiles[selectedProfileKey]?.image_url ??
        DEFAULT_PROPERTIES.defaultProfile.image_url;
    }

    if (nameElement) {
      nameElement.textContent =
        profiles[selectedProfileKey]?.name ??
        DEFAULT_PROPERTIES.defaultProfile.name;
    }
  }

  Promise.all([checkAndUpdateApiMessage(), setTheme(), fillProfile()]).catch(
    // biome-ignore lint/suspicious/noConsole: error handling for popup initialization
    console.error,
  );
});

// Clean up ConsensusEngine when popup is closed
window.addEventListener('beforeunload', () => {
  ConsensusEngine.dispose();
});
