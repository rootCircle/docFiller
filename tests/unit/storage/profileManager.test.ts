import { describe, it, expect, beforeEach } from 'vitest';
import { resetBrowserMocks } from '../../mocks/browser.mock';
import {
  loadProfiles,
  saveCustomProfile,
  getSelectedProfileKey,
} from '@utils/storage/profiles/profileManager';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';

describe('ProfileManager', () => {
  beforeEach(() => {
    resetBrowserMocks();
  });

  describe('loadProfiles', () => {
    it('should load default profiles when no custom profiles exist', async () => {
      const profiles = await loadProfiles();
      
      // Should contain default profile
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeDefined();
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toEqual(
        DEFAULT_PROPERTIES.defaultProfile,
      );
    });

    it('should merge custom profiles with built-in profiles', async () => {
      const customProfile: Profile = {
        name: 'Custom Profile',
        age: '25',
        email: 'custom@example.com',
        is_custom: true,
        is_magic: false,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          'custom-id': customProfile,
        },
      });
      
      const profiles = await loadProfiles();
      
      // Should have both default and custom
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeDefined();
      expect(profiles['custom-id']).toEqual(customProfile);
    });

    it('should filter out duplicate built-in profiles from custom profiles', async () => {
      // Simulate old data where built-in was saved as custom
      const builtInAsDuplicate = {
        ...DEFAULT_PROPERTIES.defaultProfile,
        is_custom: false,
        is_magic: false,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          [DEFAULT_PROPERTIES.defaultProfileKey]: builtInAsDuplicate,
          'valid-custom': {
            name: 'Valid Custom',
            age: '30',
            is_custom: true,
            is_magic: false,
          },
        },
      });
      
      const profiles = await loadProfiles();
      const customProfiles = await browser.storage.sync.get('customProfiles');
      
      // Should not duplicate built-in profile
      expect(
        customProfiles.customProfiles?.[DEFAULT_PROPERTIES.defaultProfileKey],
      ).toBeUndefined();
      
      // Should keep valid custom profile
      expect(customProfiles.customProfiles?.['valid-custom']).toBeDefined();
    });

    it('should preserve magic profiles even if they have built-in keys', async () => {
      const magicProfile: Profile = {
        name: 'Magic Profile',
        age: '28',
        email: 'magic@example.com',
        is_custom: false,
        is_magic: true,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          [DEFAULT_PROPERTIES.defaultProfileKey]: magicProfile,
        },
      });
      
      const profiles = await loadProfiles();
      
      // Magic profile should be preserved
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toEqual(
        magicProfile,
      );
    });

    it('should preserve custom profiles with built-in keys', async () => {
      const customWithBuiltInKey: Profile = {
        name: 'Custom with Built-in Key',
        age: '35',
        is_custom: true,
        is_magic: false,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          [DEFAULT_PROPERTIES.defaultProfileKey]: customWithBuiltInKey,
        },
      });
      
      const profiles = await loadProfiles();
      
      // Custom profile should be preserved
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toEqual(
        customWithBuiltInKey,
      );
    });

    it('should handle empty custom profiles', async () => {
      await browser.storage.sync.set({
        customProfiles: {},
      });
      
      const profiles = await loadProfiles();
      
      // Should still have default profile
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeDefined();
    });

    it('should handle missing customProfiles key', async () => {
      // Don't set customProfiles at all
      const profiles = await loadProfiles();
      
      // Should still have default profile
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeDefined();
    });
  });

  describe('saveCustomProfile', () => {
    it('should save a new custom profile', async () => {
      const newProfile: Profile = {
        name: 'Test User',
        age: '30',
        email: 'test@example.com',
        phone: '+1234567890',
        is_custom: true,
        is_magic: false,
      };
      
      await saveCustomProfile(newProfile);
      
      const result = await browser.storage.sync.get('customProfiles');
      const savedProfiles = result.customProfiles as Profiles;
      
      // Find the saved profile (key is generated)
      const savedProfileKey = Object.keys(savedProfiles)[0];
      expect(savedProfiles[savedProfileKey!]).toEqual(newProfile);
    });

    it('should save multiple custom profiles', async () => {
      const profile1: Profile = {
        name: 'User 1',
        age: '25',
        is_custom: true,
        is_magic: false,
      };
      
      const profile2: Profile = {
        name: 'User 2',
        age: '35',
        is_custom: true,
        is_magic: false,
      };
      
      await saveCustomProfile(profile1);
      await saveCustomProfile(profile2);
      
      const result = await browser.storage.sync.get('customProfiles');
      const savedProfiles = result.customProfiles as Profiles;
      
      expect(Object.keys(savedProfiles)).toHaveLength(2);
    });

    it('should preserve existing custom profiles when adding new one', async () => {
      const existingProfile: Profile = {
        name: 'Existing',
        age: '40',
        is_custom: true,
        is_magic: false,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          'existing-id': existingProfile,
        },
      });
      
      const newProfile: Profile = {
        name: 'New',
        age: '30',
        is_custom: true,
        is_magic: false,
      };
      
      await saveCustomProfile(newProfile);
      
      const result = await browser.storage.sync.get('customProfiles');
      const savedProfiles = result.customProfiles as Profiles;
      
      expect(savedProfiles['existing-id']).toEqual(existingProfile);
      expect(Object.keys(savedProfiles)).toHaveLength(2);
    });
  });

  describe('getSelectedProfileKey', () => {
    it('should return selected profile key from storage', async () => {
      const selectedKey = 'test-profile-key';
      
      await browser.storage.sync.set({
        selectedProfileKey: selectedKey,
      });
      
      const result = await getSelectedProfileKey();
      
      expect(result).toBe(selectedKey);
    });

    it('should return default profile key when not set', async () => {
      const result = await getSelectedProfileKey();
      
      expect(result).toBe(DEFAULT_PROPERTIES.defaultProfileKey);
    });

    it('should return default profile key when explicitly set to default', async () => {
      await browser.storage.sync.set({
        selectedProfileKey: DEFAULT_PROPERTIES.defaultProfileKey,
      });
      
      const result = await getSelectedProfileKey();
      
      expect(result).toBe(DEFAULT_PROPERTIES.defaultProfileKey);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full profile lifecycle', async () => {
      // 1. Load initial profiles (should have defaults)
      let profiles = await loadProfiles();
      expect(profiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeDefined();
      
      // 2. Save a custom profile
      const customProfile: Profile = {
        name: 'Integration Test',
        age: '32',
        email: 'integration@test.com',
        is_custom: true,
        is_magic: false,
      };
      
      await saveCustomProfile(customProfile);
      
      // 3. Load profiles again (should include new custom)
      profiles = await loadProfiles();
      const customKeys = Object.keys(profiles).filter(
        (key) => key !== DEFAULT_PROPERTIES.defaultProfileKey,
      );
      
      expect(customKeys.length).toBeGreaterThan(0);
    });

    it('should handle profile selection', async () => {
      // Save custom profile
      const customProfile: Profile = {
        name: 'Selectable Profile',
        age: '28',
        is_custom: true,
        is_magic: false,
      };
      
      await saveCustomProfile(customProfile);
      
      // Get the generated key
      const result = await browser.storage.sync.get('customProfiles');
      const savedProfiles = result.customProfiles as Profiles;
      const customKey = Object.keys(savedProfiles)[0];
      
      // Select the profile
      await browser.storage.sync.set({
        selectedProfileKey: customKey,
      });
      
      // Verify selection
      const selectedKey = await getSelectedProfileKey();
      expect(selectedKey).toBe(customKey);
    });

    it('should clean up duplicate built-ins on load', async () => {
      // Setup: Create situation with duplicate built-in
      const duplicateBuiltIn = {
        ...DEFAULT_PROPERTIES.defaultProfile,
        is_custom: false,
        is_magic: false,
      };
      
      const validCustom: Profile = {
        name: 'Valid',
        age: '30',
        is_custom: true,
        is_magic: false,
      };
      
      await browser.storage.sync.set({
        customProfiles: {
          [DEFAULT_PROPERTIES.defaultProfileKey]: duplicateBuiltIn,
          'valid-custom-id': validCustom,
        },
      });
      
      // Load profiles (should trigger cleanup)
      await loadProfiles();
      
      // Verify cleanup happened
      const cleaned = await browser.storage.sync.get('customProfiles');
      const cleanedProfiles = cleaned.customProfiles as Profiles;
      
      expect(cleanedProfiles[DEFAULT_PROPERTIES.defaultProfileKey]).toBeUndefined();
      expect(cleanedProfiles['valid-custom-id']).toBeDefined();
    });
  });
});



