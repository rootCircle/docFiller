import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { safeQuerySelector } from '@utils/domUtils';
import { EMPTY_STRING } from '@utils/settings';
import {
  deleteProfile,
  getSelectedProfileKey,
  loadProfiles,
  saveCustomProfile,
  saveSelectedProfileKey,
} from '@utils/storage/profiles/profileManager';
import { showToast } from '@utils/toastUtils';

async function createProfileCards() {
  // Render profile cards inside the existing Profiles tab container
  const cardsHost = (document.getElementById('profileCards') ||
    document.querySelector(
      '#tab-profiles .profile-cards',
    )) as HTMLDivElement | null;

  if (!cardsHost) {
    return;
  }

  // Reset existing cards
  cardsHost.innerHTML = '';

  const profiles = await loadProfiles();

  const selectedProfileKey = await getSelectedProfileKey();

  const orderedProfiles = Object.entries(profiles).sort((a, b) => {
    if (a[1].is_magic) {
      return -1;
    }
    if (b[1].is_magic) {
      return 1;
    }
    return 0;
  });

  orderedProfiles.forEach(([profileKey, profile]) => {
    const card = document.createElement('div');
    card.className = `profile-card ${profile.is_magic ? 'magic-profile-card' : ''}`;
    if (profileKey === selectedProfileKey) {
      card.classList.add('selected');
    }

    card.innerHTML = `<div class="card-icons">
      <div class="delete-mark ${profiles[profileKey]?.is_custom === false ? 'hidden' : ''}">
          ×
      </div>
      <div class="icon-group">
          <div class="${profileKey === selectedProfileKey ? 'edit-mark-selected' : 'edit-mark'} ${profiles[profileKey]?.is_custom === false ? 'hidden' : ''}">✎</div>
          <div class="tick-mark ${profileKey === selectedProfileKey ? '' : 'hidden'}">✓</div>
      </div>
    </div>
    <img loading="lazy" src="${profile.image_url}" alt="${profile.name}" class="profile-image">
    <h3>${profile.name}</h3>
    <p>${profile.short_description}</p>`;

    // Add the edit button handler
    const editButton = card.querySelector('.edit-mark, .edit-mark-selected');
    if (editButton) {
      editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const modal = document.getElementById('addProfileModal');
        const form = document.getElementById(
          'addProfileForm',
        ) as HTMLFormElement;
        if (modal && form) {
          const profileNameInput = safeQuerySelector<HTMLInputElement>(
            form,
            '#profileName',
          );
          const profileImageInput = safeQuerySelector<HTMLInputElement>(
            form,
            '#profileImage',
          );
          const profilePromptInput = safeQuerySelector<HTMLTextAreaElement>(
            form,
            '#profilePrompt',
          );
          const profileShortDescInput = safeQuerySelector<HTMLInputElement>(
            form,
            '#profileShortDescription',
          );

          if (profileNameInput) profileNameInput.value = profile.name;
          if (profileImageInput) profileImageInput.value = profile.image_url;
          if (profilePromptInput)
            profilePromptInput.value = profile.system_prompt;
          if (profileShortDescInput)
            profileShortDescInput.value = profile.short_description;

          modal.classList.remove('hidden');

          form.onsubmit = async (submitEvent) => {
            submitEvent.preventDefault();
            const profileNameInput = safeQuerySelector<HTMLInputElement>(
              form,
              '#profileName',
            );
            const profileImageInput = safeQuerySelector<HTMLInputElement>(
              form,
              '#profileImage',
            );
            const profilePromptInput = safeQuerySelector<HTMLTextAreaElement>(
              form,
              '#profilePrompt',
            );
            const profileShortDescInput = safeQuerySelector<HTMLInputElement>(
              form,
              '#profileShortDescription',
            );

            const updatedProfile: Profile = {
              name: profileNameInput?.value || EMPTY_STRING,
              image_url: profileImageInput?.value || EMPTY_STRING,
              system_prompt: profilePromptInput?.value || EMPTY_STRING,
              short_description: profileShortDescInput?.value || EMPTY_STRING,
              is_custom: true,
            };
            try {
              await saveCustomProfile(updatedProfile);
              await deleteProfile(profileKey);
              modal.classList.add('hidden');
              form.reset();
              await createProfileCards();
            } catch {
              showToast('Failed to update profile. Please try again.', 'error');
            }
          };
        }
      });
    }

    card.addEventListener('click', () => {
      (async () => {
        document.querySelectorAll('.profile-card').forEach((c) => {
          c.classList.remove('selected');
          const tickMark = c.querySelector('.tick-mark');
          const editMark = c.querySelector('.edit-mark-selected, .edit-mark');
          if (tickMark) {
            tickMark.classList.add('hidden');
          }
          if (editMark) {
            editMark.className = editMark.className.replace(
              'edit-mark-selected',
              'edit-mark',
            );
          }
        });
        card.classList.add('selected');
        const tickMark = card.querySelector('.tick-mark');
        const editMark = card.querySelector('.edit-mark');
        if (tickMark) {
          tickMark.classList.remove('hidden');
        }
        if (editMark && !editMark.classList.contains('hidden')) {
          editMark.className = editMark.className.replace(
            'edit-mark',
            'edit-mark-selected',
          );
        }
        await saveSelectedProfileKey(profileKey);
      })().catch((error) => {
        handleError('Failed to save selected profile key:', error);
      });
    });

    const deleteButton = card.querySelector('.delete-mark');
    if (deleteButton) {
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        (async () => {
          try {
            if (confirm('Are you sure you want to delete this profile?')) {
              await deleteProfile(profileKey);
              await createProfileCards();
            }
          } catch (error) {
            handleError('Failed to delete profile:', error);
          }
        })().catch((error) => {
          handleError('Unexpected error:', error);
        });
      });
    }
    cardsHost.appendChild(card);
  });
  // Add Profile card (click to open modal)
  const addCard = document.createElement('div');
  addCard.className = 'profile-card add-profile';
  addCard.innerHTML = `
      <div class="add-profile-content">
        <div class="add-icon">+</div>
        <p>Add New Profile</p>
      </div>
    `;
  addCard.addEventListener('click', showAddProfileModal);
  cardsHost.appendChild(addCard);
}

function showAddProfileModal() {
  const modal = document.getElementById('addProfileModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

async function handleProfileFormSubmit(submitEvent: Event) {
  submitEvent.preventDefault();
  const form = submitEvent.target as HTMLFormElement;

  const profileImageInput = safeQuerySelector<HTMLInputElement>(
    form,
    '#profileImage',
  );
  const profileNameInput = safeQuerySelector<HTMLInputElement>(
    form,
    '#profileName',
  );
  const profilePromptInput = safeQuerySelector<HTMLTextAreaElement>(
    form,
    '#profilePrompt',
  );
  const profileShortDescInput = safeQuerySelector<HTMLInputElement>(
    form,
    '#profileShortDescription',
  );

  const imageUrl = profileImageInput?.value || EMPTY_STRING;

  // Use the dummy image URL if no image URL is provided
  const defaultImageUrl = DEFAULT_PROPERTIES.defaultProfile.image_url;

  const newProfile: Profile = {
    name: profileNameInput?.value || EMPTY_STRING,
    image_url: imageUrl.trim() || defaultImageUrl,
    system_prompt: profilePromptInput?.value || EMPTY_STRING,
    short_description: profileShortDescInput?.value || EMPTY_STRING,
    is_custom: true,
  };

  try {
    await saveCustomProfile(newProfile);
    const modal = document.getElementById('addProfileModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    form.reset();
    await createProfileCards();
  } catch (_error) {
    showToast('Failed to save profile. Please try again.', 'error');
  }
}

function handleError(message: string, error: unknown) {
  // Custom error handling logic
  showToast(`${message} ${String(error)}`, 'error');
}

export { createProfileCards, handleProfileFormSubmit };
