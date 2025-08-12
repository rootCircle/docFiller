import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { profilesData } from '@utils/storage/profiles/profilesData';
import {
  getMultipleStorageItems,
  getStorageItem,
  setStorageItems,
} from '@utils/storage/storageHelper';
import { v4 } from 'uuid';

async function loadProfiles(): Promise<Profiles> {
  const rawCustomProfiles =
    (await getStorageItem<Profiles>('customProfiles')) || {};

  /*
    Hotfix: older builds saved built-ins into customProfiles, causing duplicate "All Rounder"
    and missing "Human". We now filter built-in keys (from defaults + profilesData) out of
    customProfiles on load and write back the cleaned map. No legacy normalization; customs untouched.
  */
  const builtInKeys = new Set<string>([
    DEFAULT_PROPERTIES.defaultProfileKey,
    ...Object.keys(profilesData),
  ]);

  const customProfiles: Profiles = {};
  let changed = false;
  for (const [k, v] of Object.entries(rawCustomProfiles)) {
    if (builtInKeys.has(k)) {
      const p = v as Profile;
      if (p?.is_magic || p?.is_custom) {
        customProfiles[k] = p;
      } else {
        changed = true;
      }
      continue;
    }
    customProfiles[k] = v as Profile;
  }

  if (changed) {
    await setStorageItems({ customProfiles });
  }

  return {
    [DEFAULT_PROPERTIES.defaultProfileKey]: DEFAULT_PROPERTIES.defaultProfile,
    ...profilesData,
    ...customProfiles,
  };
}

async function saveCustomProfile(profile: Profile): Promise<void> {
  const customProfiles =
    (await getStorageItem<Profiles>('customProfiles')) || {};
  const profileKey = v4();

  const updatedProfiles = {
    ...customProfiles,
    [profileKey]: profile,
  };

  await setStorageItems({
    customProfiles: updatedProfiles,
    selectedProfileKey: profileKey,
  });
}

async function deleteProfile(profileKey: string): Promise<void> {
  const { customProfiles, selectedProfileKey } = await getMultipleStorageItems<{
    customProfiles: Profiles;
    selectedProfileKey: string;
  }>(['customProfiles', 'selectedProfileKey']);

  const profiles = customProfiles || {};
  const { [profileKey]: _deletedProfile, ...remainingProfiles } = profiles;

  const updates: Record<string, Profiles | string> = {
    customProfiles: remainingProfiles,
  };

  if (selectedProfileKey === profileKey) {
    updates['selectedProfileKey'] = '';
  }

  await setStorageItems(updates);
}

async function saveSelectedProfileKey(profileKey: string): Promise<void> {
  await setStorageItems({ selectedProfileKey: profileKey });
}

async function getSelectedProfileKey(): Promise<string> {
  const selectedProfileKey = await getStorageItem<string>('selectedProfileKey');
  return selectedProfileKey ?? DEFAULT_PROPERTIES.defaultProfileKey;
}

export {
  loadProfiles,
  saveCustomProfile,
  deleteProfile,
  saveSelectedProfileKey,
  getSelectedProfileKey,
};
