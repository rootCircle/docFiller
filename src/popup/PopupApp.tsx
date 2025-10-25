import React, { useEffect, useState } from 'react';
import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import type { MessageResponse } from '@utils/messageTypes';
import { validateLLMConfiguration } from '@utils/missingApiKey';
import { getEnableDarkTheme, getIsEnabled } from '@utils/storage/getProperties';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';
import { setIsEnabled } from '@utils/storage/setProperties';
import { showToast } from '@utils/toastUtils';
import browser from 'webextension-polyfill';

type ValidationResult = {
  invalidEngines: string[];
  isConsensusEnabled: boolean;
};

const PopupApp: React.FC = () => {
  const [isEnabled, setIsEnabledState] = useState(false);
  const [previousState, setPreviousState] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const [showFill, setShowFill] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [profile, setProfile] = useState({
    name: DEFAULT_PROPERTIES.defaultProfile.name,
    imageUrl: DEFAULT_PROPERTIES.defaultProfile.image_url,
  });

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const enabled = await getIsEnabled();
        setIsEnabledState(enabled);
        setPreviousState(enabled);
      } catch (error) {
        console.error('Error loading automatic filling state:', error);
        const enabled = DEFAULT_PROPERTIES.automaticFillingEnabled;
        setIsEnabledState(enabled);
        setPreviousState(enabled);
      }
    };

    const loadTheme = async () => {
      const darkTheme = await getEnableDarkTheme();
      setIsDarkTheme(darkTheme);
      if (darkTheme) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    };

    const loadProfile = async () => {
      const selectedProfileKey = await getSelectedProfileKey();
      const profiles = await loadProfiles();
      setProfile({
        name:
          profiles[selectedProfileKey]?.name ??
          DEFAULT_PROPERTIES.defaultProfile.name,
        imageUrl:
          profiles[selectedProfileKey]?.image_url ??
          DEFAULT_PROPERTIES.defaultProfile.image_url,
      });
    };

    const checkApiConfiguration = async () => {
      const validation = (await validateLLMConfiguration()) as ValidationResult;
      const multiple = validation.invalidEngines.length > 1 ? 's' : '';

      if (validation.invalidEngines.length > 0) {
        if (validation.isConsensusEnabled) {
          setApiError(
            `Please add API keys in Options for the required model${multiple} (${validation.invalidEngines.join(', ')}) or set their weight${multiple} to 0 in consensus settings`,
          );
        } else {
          setApiError('Please add an API key in Options to use DocFiller');
        }
      } else {
        setApiError(null);
      }
    };

    Promise.all([
      loadInitialState(),
      loadTheme(),
      loadProfile(),
      checkApiConfiguration(),
    ]).catch(console.error);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      ConsensusEngine.dispose();
    };
  }, []);

  const handleToggle = async () => {
    try {
      const currentState = await getIsEnabled();
      const newState = !currentState;
      await setIsEnabled(newState);

      if (previousState !== newState) {
        setShowRefresh(true);
      }
      setPreviousState(newState);
      setIsEnabledState(newState);

      // Re-check API configuration
      const validation = (await validateLLMConfiguration()) as ValidationResult;
      const multiple = validation.invalidEngines.length > 1 ? 's' : '';

      if (validation.invalidEngines.length > 0) {
        if (validation.isConsensusEnabled) {
          setApiError(
            `Please add API keys in Options for the required model${multiple} (${validation.invalidEngines.join(', ')}) or set their weight${multiple} to 0 in consensus settings`,
          );
        } else {
          setApiError('Please add an API key in Options to use DocFiller');
        }
      } else {
        setApiError(null);
      }
    } catch (error) {
      console.error(
        `Error saving state. ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleFill = async () => {
    showToast('Starting auto-fill process...', 'info');
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      if (!tab?.url?.includes('docs.google.com/forms')) {
        showToast('Please open a Google Form to use auto-fill', 'error');
        return;
      }

      if (!tab.id) {
        showToast('Error: Could not get tab ID', 'error');
        return;
      }

      const response = (await browser.tabs.sendMessage(tab.id, {
        action: 'fillForm',
      })) as MessageResponse;
      if (response?.success) {
        showToast('Auto-fill completed successfully!', 'success');
      } else {
        showToast(
          `Auto-fill failed: ${response?.error || 'Unknown error'}`,
          'error',
        );
      }
    } catch (_error) {
      showToast('Error: Could not communicate with page', 'error');
    }
  };

  const handleRefresh = async () => {
    try {
      await browser.tabs.reload();
    } catch (error) {
      console.error('Failed to reload tab:', error);
    }
  };

  return (
    <div className="popup-container">
      {apiError && (
        <div className="api-message">
          <span className="api-message-text">{apiError}</span>
          <a href="/src/options/index.html" target="_blank">
            Options
          </a>
        </div>
      )}
      <div className="button-container">
        {showRefresh && (
          <div className="button-section-vertical-left">
            <img
              src="../../assets/icons/refresh.svg"
              alt="Refresh"
              className="refresh-icon"
              title="Refresh current page"
              onClick={handleRefresh}
            />
          </div>
        )}
        <div
          id="toggleButton"
          className={`toggle-switch ${apiError ? 'disabled' : ''}`}
          onClick={apiError ? undefined : handleToggle}
          style={{ pointerEvents: apiError ? 'none' : 'auto' }}
        >
          <img
            src="../../assets/icons/power-on.svg"
            alt="Power On"
            className="toggle-on"
            style={{ display: isEnabled ? 'block' : 'none' }}
          />
          <img
            src="../../assets/icons/power-off.svg"
            alt="Power Off"
            className="toggle-off"
            style={{ display: isEnabled ? 'none' : 'block' }}
          />
        </div>
        {showFill && (
          <div className="button-section-vertical-right" onClick={handleFill}>
            <img
              src="../../assets/icons/fill-icon.svg"
              alt="Fill"
              className="fill-icon"
            />
          </div>
        )}
      </div>
      <div className="content">
        <div className="user-profile-section">
          <div className="signin-text">Currently using the brains of</div>
          <div className="profile-stats">
            <div className="profile-avatar">
              <img src={profile.imageUrl} alt="Profile Avatar" />
            </div>
            <div className="profile-name">{profile.name}</div>
          </div>
          <div className="profile-list">
            <a
              target="_blank"
              href="/src/options/index.html"
              className="more-button"
            >
              Change
            </a>
          </div>
        </div>
      </div>
      {apiError && (
        <div className="api-message">
          To use DocFiller, please go to{' '}
          <a href="/src/options/index.html" target="_blank">
            Options
          </a>{' '}
          to add your API key.
        </div>
      )}
      <div className="terms-privacy">
        <p>
          By using this extension, you agree to the
          <br />
          <a
            href="https://github.com/rootCircle/docFiller/blob/dev/docs/TERMS_OF_USE.md"
            target="_blank"
          >
            Terms of Use
          </a>{' '}
          and the{' '}
          <a
            href="https://github.com/rootCircle/docFiller/blob/dev/docs/PRIVACY_POLICY.md"
            target="_blank"
          >
            Privacy Policy
          </a>
        </p>
      </div>
      <div id="toast-container" className="toast-container">
        <div id="toast" className="toast">
          <div id="toast-message"></div>
        </div>
      </div>
    </div>
  );
};

export default PopupApp;
