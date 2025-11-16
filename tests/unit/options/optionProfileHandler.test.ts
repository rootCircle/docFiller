import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createProfileCards,
  handleProfileFormSubmit,
} from '@options/optionProfileHandler';

const loadProfilesMock = vi.fn();
const getSelectedProfileKeyMock = vi.fn();
const saveSelectedProfileKeyMock = vi.fn();
const saveCustomProfileMock = vi.fn();
const deleteProfileMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('@utils/storage/profiles/profileManager', () => ({
  loadProfiles: (...args: unknown[]) => loadProfilesMock(...args),
  getSelectedProfileKey: (...args: unknown[]) =>
    getSelectedProfileKeyMock(...args),
  saveSelectedProfileKey: (...args: unknown[]) =>
    saveSelectedProfileKeyMock(...args),
  saveCustomProfile: (...args: unknown[]) => saveCustomProfileMock(...args),
  deleteProfile: (...args: unknown[]) => deleteProfileMock(...args),
}));

vi.mock('@utils/toastUtils', () => ({
  showToast: (...args: unknown[]) => showToastMock(...args),
}));

vi.mock('@utils/defaultProperties', () => ({
  DEFAULT_PROPERTIES: {
    defaultProfile: {
      image_url: 'default.png',
    },
  },
}));

describe('optionProfileHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = `
      <div id="profileCards"></div>
      <div id="addProfileModal" class="hidden">
        <button class="close-button"></button>
        <button class="cancel-button"></button>
      </div>
    `;
    loadProfilesMock.mockResolvedValue({
      default: {
        name: 'Default',
        image_url: 'default.png',
        system_prompt: 'Prompt',
        short_description: 'Short',
        is_magic: false,
        is_custom: false,
      },
      magic: {
        name: 'Magic',
        image_url: 'magic.png',
        system_prompt: 'Magic',
        short_description: 'Magic desc',
        is_magic: true,
        is_custom: true,
      },
    });
    getSelectedProfileKeyMock.mockResolvedValue('default');
    saveCustomProfileMock.mockResolvedValue(undefined);
    deleteProfileMock.mockResolvedValue(undefined);
    saveSelectedProfileKeyMock.mockResolvedValue(undefined);
    showToastMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders profile cards and handles selection', async () => {
    await createProfileCards();
    const cards = document.querySelectorAll('.profile-card');
    expect(cards.length).toBeGreaterThan(1);

    const magicCard = Array.from(cards).find((card) =>
      card.classList.contains('magic-profile-card'),
    ) as HTMLElement;
    expect(magicCard).toBeTruthy();

    magicCard.click();
    await Promise.resolve();
    expect(saveSelectedProfileKeyMock).toHaveBeenCalledWith('magic');
  });

  it('handles profile deletion with confirmation', async () => {
    (window as any).confirm = vi.fn(() => true);
    await createProfileCards();
    const deleteButton = document.querySelector(
      '.profile-card .delete-mark',
    ) as HTMLElement;
    deleteButton.click();
    await Promise.resolve();

    expect(deleteProfileMock).toHaveBeenCalled();
  });

  it('submits profile form and saves custom profile', async () => {
    await createProfileCards();
    const form = document.createElement('form');
    form.innerHTML = `
      <input id="profileName" value="New Name" />
      <input id="profileImage" value="img.png" />
      <textarea id="profilePrompt">Prompt</textarea>
      <input id="profileShortDescription" value="Short" />
    `;

    const submitEvent = new Event('submit');
    Object.defineProperty(submitEvent, 'target', { value: form });
    await handleProfileFormSubmit(submitEvent);

    expect(saveCustomProfileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
        image_url: 'img.png',
      }),
    );
  });
});
