import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabList,
  TabButton,
  TabPanels,
  TabPanel,
} from '../components/Tabs';
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
import {
  deleteProfile,
  getSelectedProfileKey,
  loadProfiles,
  saveCustomProfile,
  saveSelectedProfileKey,
} from '@utils/storage/profiles/profileManager';
import { MetricsCalculator } from '@utils/metricsCalculator';
import { MetricsManager } from '@utils/storage/metricsManager';

/**
 * OptionsApp Component - Complete React implementation of options page
 */
const OptionsApp: React.FC = () => {
  // Theme state
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [skipMarked, setSkipMarked] = useState(false);

  // Profile state
  const [profiles, setProfiles] = useState<Profiles>({});
  const [selectedProfileKey, setSelectedProfileKey] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    key: string;
    name: string;
    imageUrl: string;
    prompt: string;
    shortDesc: string;
  } | null>(null);

  // API settings state
  const [llmModel, setLLMModelState] = useState('');
  const [enableConsensus, setEnableConsensusState] = useState(false);
  const [chatGptApiKey, setChatGptApiKeyState] = useState('');
  const [geminiApiKey, setGeminiApiKeyState] = useState('');
  const [mistralApiKey, setMistralApiKeyState] = useState('');
  const [anthropicApiKey, setAnthropicApiKeyState] = useState('');
  const [weights, setWeights] = useState<Record<LLMEngineType, number>>(
    {} as Record<LLMEngineType, number>,
  );
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalForms: 0,
    successRate: 0,
    timeSaved: 0,
    streak: 0,
  });
  const [showResetMetricsModal, setShowResetMetricsModal] = useState(false);

  // Advanced settings
  const [sleepDuration, setSleepDurationState] = useState(2000);

  // Load all settings on mount
  useEffect(() => {
    loadAllSettings();
    const metricsInterval = setInterval(loadMetrics, 5000);
    return () => clearInterval(metricsInterval);
  }, []);

  const loadAllSettings = async () => {
    try {
      // Load theme and behavior
      const darkTheme = await getEnableDarkTheme();
      const skipMarkedSetting = await getSkipMarkedSetting();
      setIsDarkTheme(darkTheme);
      setSkipMarked(skipMarkedSetting);

      if (darkTheme) {
        document.body.classList.add('dark-theme');
      }

      // Load profiles
      const loadedProfiles = await loadProfiles();
      const selectedKey = await getSelectedProfileKey();
      setProfiles(loadedProfiles);
      setSelectedProfileKey(selectedKey);

      // Load API settings
      const consensus = await getEnableConsensus();
      const model = await getLLMModel();
      const weightsData = await getLLMWeights();

      setEnableConsensusState(consensus);
      setLLMModelState(model);
      setWeights(weightsData);

      setChatGptApiKeyState(await getChatGptApiKey());
      setGeminiApiKeyState(await getGeminiApiKey());
      setMistralApiKeyState(await getMistralApiKey());
      setAnthropicApiKeyState(await getAnthropicApiKey());

      // Load advanced settings
      const duration = await getSleepDuration();
      setSleepDurationState(duration);

      // Load metrics
      await loadMetrics();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const manager = MetricsManager.getInstance();
      const data = await manager.getMetrics();

      const formMetrics = MetricsCalculator.calculateFormMetrics(data.history);
      const successRateMetrics = MetricsCalculator.calculateSuccessRate(
        data.history,
      );
      const timeSavedMetrics = MetricsCalculator.calculateTimeSaved(
        data.history,
      );
      const streakMetrics = MetricsCalculator.calculateStreaks(
        data.history,
        data.formMetrics,
      );

      setMetrics({
        totalForms: formMetrics.total,
        successRate: successRateMetrics.rate,
        timeSaved: timeSavedMetrics.totalMin,
        streak: streakMetrics.currentStreak,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  // Profile handlers
  const handleProfileSelect = async (profileKey: string) => {
    await saveSelectedProfileKey(profileKey);
    setSelectedProfileKey(profileKey);
    showToast('Profile selected!', 'success');
  };

  const handleProfileEdit = (profileKey: string, profile: Profile) => {
    setEditingProfile({
      key: profileKey,
      name: profile.name,
      imageUrl: profile.image_url,
      prompt: profile.system_prompt,
      shortDesc: profile.short_description,
    });
    setShowProfileModal(true);
  };

  const handleProfileDelete = async (profileKey: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      await deleteProfile(profileKey);
      const loadedProfiles = await loadProfiles();
      setProfiles(loadedProfiles);
      showToast('Profile deleted!', 'success');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      const newProfile: Profile = {
        name: editingProfile.name,
        image_url: editingProfile.imageUrl,
        system_prompt: editingProfile.prompt,
        short_description: editingProfile.shortDesc,
        is_custom: true,
      };
      await saveCustomProfile(newProfile);
      const loadedProfiles = await loadProfiles();
      setProfiles(loadedProfiles);
      setShowProfileModal(false);
      setEditingProfile(null);
      showToast('Profile saved!', 'success');
    } catch (error) {
      showToast('Failed to save profile', 'error');
    }
  };

  // Theme handlers
  const handleDarkThemeToggle = async () => {
    const newValue = !isDarkTheme;
    await setEnableDarkTheme(newValue);
    setIsDarkTheme(newValue);
    if (newValue) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleSkipMarkedToggle = async () => {
    await setToggleSkipMarkedStatus();
    const newValue = await getSkipMarkedSetting();
    setSkipMarked(newValue);
  };

  // API handlers
  const handleConsensusToggle = async () => {
    const newValue = !enableConsensus;
    await setEnableConsensus(newValue);
    setEnableConsensusState(newValue);
  };

  const handleModelChange = async (modelName: string) => {
    await setLLMModel(modelName);
    setLLMModelState(modelName);
  };

  const handleApiSave = async () => {
    try {
      await setChatGptApiKey(chatGptApiKey);
      await setGeminiApiKey(geminiApiKey);
      await setMistralApiKey(mistralApiKey);
      await setAnthropicApiKey(anthropicApiKey);

      if (enableConsensus) {
        await setLLMWeights(weights);
      }

      showToast('API settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save API settings', 'error');
    }
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const needsApiKey = (modelName: string) => {
    return (
      modelName !== getModelName(LLMEngineType.Ollama) &&
      modelName !== getModelName(LLMEngineType.ChromeAI)
    );
  };

  const getAPIKeyLink = (modelName: string): string => {
    switch (modelName) {
      case getModelName(LLMEngineType.ChatGPT):
        return 'https://platform.openai.com/api-keys';
      case getModelName(LLMEngineType.Gemini):
        return 'https://aistudio.google.com/app/apikey';
      case getModelName(LLMEngineType.Mistral):
        return 'https://console.mistral.ai/api-keys/';
      case getModelName(LLMEngineType.Anthropic):
        return 'https://console.anthropic.com/settings/keys';
      default:
        return '';
    }
  };

  // Metrics handlers
  const handleMetricsExport = () => {
    MetricsManager.getInstance()
      .getMetrics()
      .then((data) => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `docfiller-metrics-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Metrics exported successfully!', 'success');
      })
      .catch(() => {
        showToast('Failed to export metrics', 'error');
      });
  };

  const handleMetricsReset = async () => {
    try {
      await MetricsManager.getInstance().resetMetrics();
      setShowResetMetricsModal(false);
      showToast('Metrics reset successfully!', 'success');
      await loadMetrics();
    } catch (error) {
      showToast('Failed to reset metrics', 'error');
    }
  };

  // Advanced handlers
  const handleAdvancedSave = async () => {
    try {
      await setSleepDuration(sleepDuration);
      showToast('Advanced settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save advanced settings', 'error');
    }
  };

  // Sort profiles
  const orderedProfiles = Object.entries(profiles).sort((a, b) => {
    if (a[1].is_magic) return -1;
    if (b[1].is_magic) return 1;
    return 0;
  });

  // Get single API key based on model
  const getSingleApiKey = () => {
    switch (llmModel) {
      case getModelName(LLMEngineType.ChatGPT):
        return chatGptApiKey;
      case getModelName(LLMEngineType.Gemini):
        return geminiApiKey;
      case getModelName(LLMEngineType.Mistral):
        return mistralApiKey;
      case getModelName(LLMEngineType.Anthropic):
        return anthropicApiKey;
      default:
        return '';
    }
  };

  const setSingleApiKey = (value: string) => {
    switch (llmModel) {
      case getModelName(LLMEngineType.ChatGPT):
        setChatGptApiKeyState(value);
        break;
      case getModelName(LLMEngineType.Gemini):
        setGeminiApiKeyState(value);
        break;
      case getModelName(LLMEngineType.Mistral):
        setMistralApiKeyState(value);
        break;
      case getModelName(LLMEngineType.Anthropic):
        setAnthropicApiKeyState(value);
        break;
    }
  };

  return (
    <>
      <h1>Settings</h1>
      <Tabs defaultTab="profiles">
        <TabList>
          <TabButton tabId="profiles">Profiles & Theme</TabButton>
          <TabButton tabId="api">API Keys & Consensus</TabButton>
          <TabButton tabId="metrics">Metrics</TabButton>
          <TabButton tabId="advanced">Advanced</TabButton>
          <TabButton tabId="about">About</TabButton>
        </TabList>

        <TabPanels>
          {/* Profiles & Theme Tab */}
          <TabPanel tabId="profiles">
            <div className="section">
              <h2 className="section-heading">Profiles</h2>
              <div className="profiles-container">
                <div className="profile-cards">
                  {orderedProfiles.map(([profileKey, profile]) => (
                    <div
                      key={profileKey}
                      className={`profile-card ${profile.is_magic ? 'magic-profile-card' : ''} ${profileKey === selectedProfileKey ? 'selected' : ''}`}
                      onClick={() => handleProfileSelect(profileKey)}
                    >
                      <div className="card-icons">
                        {profile.is_custom && (
                          <div
                            className="delete-mark"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileDelete(profileKey);
                            }}
                          >
                            ×
                          </div>
                        )}
                        <div className="icon-group">
                          {profile.is_custom && (
                            <div
                              className={
                                profileKey === selectedProfileKey
                                  ? 'edit-mark-selected'
                                  : 'edit-mark'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProfileEdit(profileKey, profile);
                              }}
                            >
                              ✎
                            </div>
                          )}
                          {profileKey === selectedProfileKey && (
                            <div className="tick-mark">✓</div>
                          )}
                        </div>
                      </div>
                      <img
                        loading="lazy"
                        src={profile.image_url}
                        alt={profile.name}
                        className="profile-image"
                      />
                      <h3>{profile.name}</h3>
                      <p>{profile.short_description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section">
              <h2 className="section-heading">Theme & Behavior</h2>
              <div className="setting-group">
                <div className="toggle-setting">
                  <span className="setting-label">Dark Theme</span>
                  <div
                    className={`creative-toggle ${isDarkTheme ? 'enabled' : ''}`}
                    onClick={handleDarkThemeToggle}
                  >
                    <div className="toggle-track">
                      <div className="toggle-thumb">
                        <svg className="check-icon" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        <svg className="cross-icon" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="setting-group">
                <div className="toggle-setting">
                  <span className="setting-label">
                    Skip Already Filled Questions
                  </span>
                  <div
                    className={`creative-toggle ${skipMarked ? 'enabled' : ''}`}
                    onClick={handleSkipMarkedToggle}
                  >
                    <div className="toggle-track">
                      <div className="toggle-thumb">
                        <svg className="check-icon" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        <svg className="cross-icon" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* API Keys & Consensus Tab */}
          <TabPanel tabId="api">
            <div className="section">
              <h2 className="section-heading">AI Model Settings</h2>
              <div className="toggleConsensusMenu">
                <input
                  type="checkbox"
                  id="enableConsensus"
                  checked={enableConsensus}
                  onChange={handleConsensusToggle}
                />
                <label htmlFor="enableConsensus" className="setting-label">
                  Enable Consensus
                </label>
              </div>

              {!enableConsensus ? (
                <div className="form-group">
                  <label htmlFor="llmModel">LLM Model</label>
                  <select
                    id="llmModel"
                    value={llmModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                  >
                    <option value={getModelName(LLMEngineType.Gemini)}>
                      Gemini
                    </option>
                    <option value={getModelName(LLMEngineType.ChatGPT)}>
                      ChatGPT
                    </option>
                    <option value={getModelName(LLMEngineType.Ollama)}>
                      Ollama
                    </option>
                    <option value={getModelName(LLMEngineType.ChromeAI)}>
                      Chrome AI
                    </option>
                    <option value={getModelName(LLMEngineType.Mistral)}>
                      Mistral
                    </option>
                    <option value={getModelName(LLMEngineType.Anthropic)}>
                      Anthropic
                    </option>
                  </select>
                  <div className="api-key-input">
                    <label htmlFor="singleApiKey">API Key</label>
                    <div className="password-container">
                      <input
                        type={showPasswords['single'] ? 'text' : 'password'}
                        id="singleApiKey"
                        value={getSingleApiKey()}
                        onChange={(e) => setSingleApiKey(e.target.value)}
                        className="password-input"
                        disabled={!needsApiKey(llmModel)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('single')}
                      >
                        👁
                      </button>
                    </div>
                    {!needsApiKey(llmModel) && (
                      <div className="warning-message">
                        {llmModel} doesn't require an API key
                      </div>
                    )}
                    {getAPIKeyLink(llmModel) && (
                      <a
                        href={getAPIKeyLink(llmModel)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-api-key"
                      >
                        Get API Key
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div id="consensusWeights">
                  <p>
                    Consensus mode uses multiple AI models. Configure weights
                    below:
                  </p>

                  {/* ChatGPT */}
                  <div className="form-group">
                    <div>
                      <label>ChatGPT API Key</label>
                      <div className="password-container">
                        <input
                          type={showPasswords['chatgpt'] ? 'text' : 'password'}
                          value={chatGptApiKey}
                          onChange={(e) =>
                            setChatGptApiKeyState(e.target.value)
                          }
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('chatgpt')}
                        >
                          👁
                        </button>
                      </div>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-api-key"
                      >
                        Get API Key
                      </a>
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.ChatGPT] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.ChatGPT]: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Gemini */}
                  <div className="form-group">
                    <div>
                      <label>Gemini API Key</label>
                      <div className="password-container">
                        <input
                          type={showPasswords['gemini'] ? 'text' : 'password'}
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKeyState(e.target.value)}
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('gemini')}
                        >
                          👁
                        </button>
                      </div>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-api-key"
                      >
                        Get API Key
                      </a>
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.Gemini] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.Gemini]: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Ollama */}
                  <div className="form-group">
                    <div>
                      <label>Ollama (No API key required)</label>
                      <input
                        type="text"
                        disabled
                        placeholder="No API key required"
                      />
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.Ollama] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.Ollama]: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Chrome AI */}
                  <div className="form-group">
                    <div>
                      <label>Chrome AI (No API key required)</label>
                      <input
                        type="text"
                        disabled
                        placeholder="No API key required"
                      />
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.ChromeAI] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.ChromeAI]: parseFloat(
                              e.target.value,
                            ),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Mistral */}
                  <div className="form-group">
                    <div>
                      <label>Mistral API Key</label>
                      <div className="password-container">
                        <input
                          type={showPasswords['mistral'] ? 'text' : 'password'}
                          value={mistralApiKey}
                          onChange={(e) =>
                            setMistralApiKeyState(e.target.value)
                          }
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('mistral')}
                        >
                          👁
                        </button>
                      </div>
                      <a
                        href="https://console.mistral.ai/api-keys/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-api-key"
                      >
                        Get API Key
                      </a>
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.Mistral] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.Mistral]: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Anthropic */}
                  <div className="form-group">
                    <div>
                      <label>Anthropic API Key</label>
                      <div className="password-container">
                        <input
                          type={
                            showPasswords['anthropic'] ? 'text' : 'password'
                          }
                          value={anthropicApiKey}
                          onChange={(e) =>
                            setAnthropicApiKeyState(e.target.value)
                          }
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('anthropic')}
                        >
                          👁
                        </button>
                      </div>
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-api-key"
                      >
                        Get API Key
                      </a>
                    </div>
                    <div>
                      <label>Weight</label>
                      <input
                        type="number"
                        value={weights[LLMEngineType.Anthropic] || 0}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [LLMEngineType.Anthropic]: parseFloat(
                              e.target.value,
                            ),
                          })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <button type="button" onClick={handleApiSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </TabPanel>

          {/* Metrics Tab */}
          <TabPanel tabId="metrics">
            <div className="section">
              <h2 className="section-heading">Usage Metrics</h2>
              <div className="metrics-container">
                <div className="metrics-summary">
                  <div className="metric-card">
                    <h3>Total Forms Filled</h3>
                    <p className="metric-value">{metrics.totalForms}</p>
                  </div>
                  <div className="metric-card">
                    <h3>Success Rate</h3>
                    <p className="metric-value">
                      {metrics.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="metric-card">
                    <h3>Time Saved</h3>
                    <p className="metric-value">{metrics.timeSaved} mins</p>
                  </div>
                  <div className="metric-card">
                    <h3>Streaks</h3>
                    <p className="metric-value">{metrics.streak}</p>
                    <div className="metric-trend">Current streak</div>
                  </div>
                </div>

                <div className="metrics-controls">
                  <div
                    className="btn btn-primary"
                    onClick={handleMetricsExport}
                  >
                    <span className="icon">📊</span> Export Metrics
                  </div>
                  <div
                    className="btn btn-secondary"
                    onClick={() => setShowResetMetricsModal(true)}
                  >
                    <span className="icon">🔄</span> Reset Metrics
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel tabId="advanced">
            <div className="section">
              <h2 className="section-heading">Advanced Settings</h2>
              <div className="advanced-panel">
                <div className="form-group">
                  <label htmlFor="sleepDuration">Sleep Duration (ms)</label>
                  <input
                    type="number"
                    id="sleepDuration"
                    value={sleepDuration}
                    onChange={(e) =>
                      setSleepDurationState(parseInt(e.target.value))
                    }
                    min="100"
                    step="100"
                  />
                </div>
              </div>
              <div className="action-buttons">
                <button type="button" onClick={handleAdvancedSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </TabPanel>

          {/* About Tab */}
          <TabPanel tabId="about">
            <div className="about-logo">
              <img
                src="../../assets/icons/icon-form-96.png"
                alt="docFiller logo"
                width="72"
                height="72"
                loading="lazy"
              />
            </div>
            <div className="section">
              <h2 className="section-heading">About docFiller</h2>
              <p>
                docFiller is an open-source browser extension that automates
                filling repetitive forms using GenAI. It supports multiple LLM
                providers, optional consensus across models, and a profiles
                system to tailor prompts and behavior to your workflow.
              </p>
            </div>

            <div className="section">
              <h2 className="section-heading">Repository</h2>
              <p>
                <a
                  href="https://github.com/rootCircle/docFiller"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/rootCircle/docFiller
                </a>
              </p>
            </div>

            <div className="section">
              <h2 className="section-heading">Contributing</h2>
              <ul>
                <li>
                  This project is community-driven; no formal support is
                  provided.
                </li>
                <li>
                  Contributions are welcome—please read the guidelines before
                  opening a PR.
                </li>
                <li>Be respectful and follow the Code of Conduct.</li>
              </ul>
              <p>
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/docs/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contributing Guide
                </a>
                {' · '}
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/docs/CODE_OF_CONDUCT.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code of Conduct
                </a>
                {' · '}
                <a
                  href="https://github.com/rootCircle/docFiller/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contributors
                </a>
              </p>
            </div>

            <div className="section">
              <h2 className="section-heading">Report bugs</h2>
              <ol>
                <li>Search existing issues to avoid duplicates.</li>
                <li>
                  Include clear reproduction steps and expected vs. actual
                  behavior.
                </li>
                <li>
                  Provide your browser, OS, and extension version (see the
                  manifest).
                </li>
                <li>Attach screenshots or minimal examples if possible.</li>
              </ol>
              <p>
                <a
                  href="https://github.com/rootCircle/docFiller/issues/new/choose"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open a new issue
                </a>
              </p>
            </div>

            <div className="section">
              <h2 className="section-heading">Security & privacy</h2>
              <p>
                For vulnerabilities, please review the security policy and
                report responsibly. See our privacy policy for data practices.
              </p>
              <p>
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/docs/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Security Policy
                </a>
                {' · '}
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/docs/PRIVACY_POLICY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                {' · '}
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/docs/TERMS_OF_USE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Use
                </a>
                {' · '}
                <a
                  href="https://github.com/rootCircle/docFiller/blob/dev/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  License
                </a>
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Profile Edit Modal */}
      {showProfileModal && editingProfile && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close-button"
              onClick={() => {
                setShowProfileModal(false);
                setEditingProfile(null);
              }}
            >
              &times;
            </span>
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={editingProfile.imageUrl}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      imageUrl: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Prompt</label>
                <textarea
                  value={editingProfile.prompt}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      prompt: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  value={editingProfile.shortDesc}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      shortDesc: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Save Profile
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setEditingProfile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metrics Reset Modal */}
      {showResetMetricsModal && (
        <div className="custom-modal">
          <div className="modal-content">
            <div className="modal-body">
              <p>
                Are you sure you want to reset all metrics? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setShowResetMetricsModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={handleMetricsReset}>
                Reset Metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div id="toast-container" className="toast-container">
        <div id="toast" className="toast">
          <div id="toast-message"></div>
        </div>
      </div>
    </>
  );
};

export default OptionsApp;
