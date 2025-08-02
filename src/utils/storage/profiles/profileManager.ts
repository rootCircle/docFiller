import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { v4 } from 'uuid';

import { profilesData } from './profilesData';

function loadProfiles(): Promise<Profiles> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['customProfiles'], (result) => {
      const customProfiles: Profiles =
        (result['customProfiles'] as Profiles) || {};

      const mergedProfiles = {
        [DEFAULT_PROPERTIES.defaultProfileKey]:
          DEFAULT_PROPERTIES.defaultProfile,
        ...profilesData,
        ...customProfiles,
      };

      resolve(mergedProfiles);
    });
  });
}

function saveCustomProfile(profile: Profile): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['customProfiles'], (result) => {
      const customProfiles: Profiles =
        (result['customProfiles'] as Profiles) || {};

      const profileKey = v4();

      const updatedProfiles = {
        ...customProfiles,

        [profileKey]: profile,
      };

      chrome.storage.sync.set(
        {
          customProfiles: updatedProfiles,
          selectedProfileKey: profileKey,
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError?.message || 'Unknown error occurred',
              ),
            );
          } else {
            resolve();
          }
        },
      );
    });
  });
}

function deleteProfile(profileKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ['customProfiles', 'selectedProfileKey'],
      (result) => {
        const customProfiles: Profiles =
          (result['customProfiles'] as Profiles) || {};
        const { [profileKey]: _deletedProfile, ...remainingProfiles } =
          customProfiles;

        const updates: Record<string, Profiles | string> = {
          customProfiles: remainingProfiles,
        };

        if (result['selectedProfileKey'] === profileKey) {
          updates['selectedProfileKey'] = '';
        }

        chrome.storage.sync.set(updates, () => {
          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError.message || 'Failed to delete profile',
              ),
            );
          } else {
            resolve();
          }
        });
      },
    );
  });
}

function saveSelectedProfileKey(profileKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ selectedProfileKey: profileKey }, () => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message || 'Unknown error occurred',
          ),
        );
      } else {
        resolve();
      }
    });
  });
}

async function getSelectedProfileKey() {
  return await new Promise<string>((resolve) => {
    chrome.storage.sync.get(['selectedProfileKey'], (result) => {
      resolve(
        (result['selectedProfileKey'] as string) ??
          DEFAULT_PROPERTIES.defaultProfileKey,
      );
    });
  });
}

export {
  loadProfiles,
  saveCustomProfile,
  deleteProfile,
  saveSelectedProfileKey,
  getSelectedProfileKey,
};
