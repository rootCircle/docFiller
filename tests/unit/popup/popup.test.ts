import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getIsEnabledMock = vi.fn();
const setIsEnabledMock = vi.fn();
const getEnableDarkThemeMock = vi.fn();
const getSelectedProfileKeyMock = vi.fn();
const loadProfilesMock = vi.fn();
const validateMock = vi.fn();
const showToastMock = vi.fn();
const disposeMock = vi.fn();

vi.mock('@utils/storage/getProperties', () => ({
  getIsEnabled: (...args: unknown[]) => getIsEnabledMock(...args),
  getEnableDarkTheme: (...args: unknown[]) => getEnableDarkThemeMock(...args),
}));

vi.mock('@utils/storage/setProperties', () => ({
  setIsEnabled: (...args: unknown[]) => setIsEnabledMock(...args),
}));

vi.mock('@utils/storage/profiles/profileManager', () => ({
  getSelectedProfileKey: (...args: unknown[]) =>
    getSelectedProfileKeyMock(...args),
  loadProfiles: (...args: unknown[]) => loadProfilesMock(...args),
}));

vi.mock('@utils/missingApiKey', () => ({
  validateLLMConfiguration: (...args: unknown[]) => validateMock(...args),
}));

vi.mock('@utils/toastUtils', () => ({
  showToast: (...args: unknown[]) => showToastMock(...args),
}));

vi.mock('@docFillerCore/engines/consensusEngine', () => ({
  ConsensusEngine: {
    dispose: disposeMock,
  },
}));

describe('popup/popup', () => {
  const originalAddEventListener = document.addEventListener;
  let messageHandlers: Record<string, EventListenerOrEventListenerObject[]> = {};

  beforeEach(() => {
    vi.resetModules();
    messageHandlers = {};

    document.addEventListener = vi.fn((event, handler) => {
      if (event === 'DOMContentLoaded') {
        handler();
      }
    }) as typeof document.addEventListener;

    window.addEventListener = vi.fn((event: string, handler: any) => {
      if (!messageHandlers[event]) {
        messageHandlers[event] = [];
      }
      messageHandlers[event]?.push(handler);
    }) as any;

    document.body.innerHTML = `
      <div id="toggleButton">
        <div class="toggle-on"></div>
        <div class="toggle-off"></div>
      </div>
      <div class="button-section-vertical-right"></div>
      <div class="button-section-vertical-left"></div>
      <div class="api-message"><span class="api-message-text"></span></div>
      <div class="profile-avatar"><img /></div>
      <div class="profile-name"></div>
    `;

    getIsEnabledMock.mockResolvedValue(false);
    setIsEnabledMock.mockResolvedValue(undefined);
    getEnableDarkThemeMock.mockResolvedValue(false);
    getSelectedProfileKeyMock.mockResolvedValue('default');
    loadProfilesMock.mockResolvedValue({
      default: { name: 'User', image_url: 'avatar.png' },
    });
    validateMock.mockResolvedValue({
      invalidEngines: [],
      isConsensusEnabled: false,
    });
    showToastMock.mockReturnValue(undefined);
    browser.tabs.query = vi
      .fn()
      .mockResolvedValue([{ id: 1, url: 'https://docs.google.com/forms/xyz' }]);
    browser.tabs.sendMessage = vi.fn().mockResolvedValue({ success: true });
    browser.tabs.reload = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.addEventListener = originalAddEventListener;
    vi.clearAllMocks();
  });

  it('initializes toggle and profile info', async () => {
    await import('@popup/popup');
    expect(getIsEnabledMock).toHaveBeenCalled();
    const name = document.querySelector('.profile-name')?.textContent;
    expect(name).toBe('User');
  });

  it('toggles automatic filling state on click', async () => {
    await import('@popup/popup');
    const toggle = document.getElementById('toggleButton') as HTMLElement;
    toggle.click();
    await Promise.resolve();

    expect(setIsEnabledMock).toHaveBeenCalled();
  });

  it('invokes fill form logic when button clicked', async () => {
    await import('@popup/popup');
    const fillButton = document.querySelector(
      '.button-section-vertical-right',
    ) as HTMLElement;
    fillButton.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      action: 'fillForm',
    });
    const lastCall = showToastMock.mock.calls.at(-1);
    expect(lastCall).toEqual([
      'Auto-fill completed successfully!',
      'success',
    ]);
  });

  it('disposes consensus engine on unload', async () => {
    await import('@popup/popup');
    const handlers = messageHandlers['beforeunload'] ?? [];
    handlers.forEach((handler) => {
      if (typeof handler === 'function') {
        handler(new Event('beforeunload'));
      }
    });
    expect(disposeMock).toHaveBeenCalled();
  });
});

