import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetBrowserMocks } from '../../mocks/browser.mock';
import {
  clearStorage,
  getMultipleStorageItems,
  getStorageItem,
  removeStorageItems,
  setStorageItem,
  setStorageItems,
} from '@utils/storage/storageHelper';

describe('StorageHelper', () => {
  beforeEach(() => {
    resetBrowserMocks();
  });

  describe('getStorageItem', () => {
    it('should retrieve a single item from storage', async () => {
      // Setup: Add item to mock storage
      await browser.storage.sync.set({ testKey: 'testValue' });

      const result = await getStorageItem<string>('testKey');

      expect(result).toBe('testValue');
    });

    it('should return undefined for non-existent key', async () => {
      const result = await getStorageItem<string>('nonExistentKey');

      expect(result).toBeUndefined();
    });

    it('should retrieve complex objects', async () => {
      const testObject = {
        name: 'John',
        age: 30,
        nested: { key: 'value' },
      };

      await browser.storage.sync.set({ complexKey: testObject });

      const result = await getStorageItem<typeof testObject>('complexKey');

      expect(result).toEqual(testObject);
    });

    it('should retrieve arrays', async () => {
      const testArray = [1, 2, 3, 4, 5];

      await browser.storage.sync.set({ arrayKey: testArray });

      const result = await getStorageItem<number[]>('arrayKey');

      expect(result).toEqual(testArray);
    });
  });

  describe('setStorageItem', () => {
    it('should set a single item in storage', async () => {
      await setStorageItem('newKey', 'newValue');

      const result = await browser.storage.sync.get('newKey');

      expect(result.newKey).toBe('newValue');
    });

    it('should overwrite existing value', async () => {
      await browser.storage.sync.set({ existingKey: 'oldValue' });

      await setStorageItem('existingKey', 'newValue');

      const result = await browser.storage.sync.get('existingKey');

      expect(result.existingKey).toBe('newValue');
    });

    it('should set complex objects', async () => {
      const testObject = {
        user: { name: 'Alice', role: 'admin' },
        settings: { theme: 'dark' },
      };

      await setStorageItem('config', testObject);

      const result = await browser.storage.sync.get('config');

      expect(result.config).toEqual(testObject);
    });

    it('should set boolean values', async () => {
      await setStorageItem('isEnabled', true);

      const result = await browser.storage.sync.get('isEnabled');

      expect(result.isEnabled).toBe(true);
    });

    it('should set null values', async () => {
      await setStorageItem('nullKey', null);

      const result = await browser.storage.sync.get('nullKey');

      expect(result.nullKey).toBe(null);
    });
  });

  describe('setStorageItems', () => {
    it('should set multiple items at once', async () => {
      const items = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };

      await setStorageItems(items);

      const result = await browser.storage.sync.get(['key1', 'key2', 'key3']);

      expect(result).toEqual(items);
    });

    it('should set items of different types', async () => {
      const items = {
        stringKey: 'string',
        numberKey: 42,
        boolKey: true,
        objectKey: { nested: 'value' },
        arrayKey: [1, 2, 3],
      };

      await setStorageItems(items);

      const result = await browser.storage.sync.get(Object.keys(items));

      expect(result).toEqual(items);
    });

    it('should overwrite existing keys', async () => {
      await browser.storage.sync.set({
        key1: 'old1',
        key2: 'old2',
      });

      await setStorageItems({
        key1: 'new1',
        key3: 'new3',
      });

      const result = await browser.storage.sync.get(['key1', 'key2', 'key3']);

      expect(result.key1).toBe('new1');
      expect(result.key2).toBe('old2'); // Unchanged
      expect(result.key3).toBe('new3');
    });

    it('should handle empty object', async () => {
      await setStorageItems({});

      const result = await browser.storage.sync.get(null);

      expect(result).toEqual({});
    });
  });

  describe('getMultipleStorageItems', () => {
    it('should retrieve multiple items', async () => {
      await browser.storage.sync.set({
        item1: 'value1',
        item2: 'value2',
        item3: 'value3',
      });

      const result = await getMultipleStorageItems<{
        item1: string;
        item2: string;
      }>(['item1', 'item2']);

      expect(result).toEqual({
        item1: 'value1',
        item2: 'value2',
      });
    });

    it('should return empty object for non-existent keys', async () => {
      const result = await getMultipleStorageItems<Record<string, any>>([
        'nonExistent1',
        'nonExistent2',
      ]);

      expect(result).toEqual({});
    });

    it('should return partial results for mixed keys', async () => {
      await browser.storage.sync.set({
        existingKey: 'value',
      });

      const result = await getMultipleStorageItems<Record<string, any>>([
        'existingKey',
        'nonExistentKey',
      ]);

      expect(result).toEqual({
        existingKey: 'value',
      });
    });

    it('should handle empty keys array', async () => {
      const result = await getMultipleStorageItems<Record<string, any>>([]);

      expect(result).toEqual({});
    });
  });

  describe('Error handling', () => {
    it('should throw error when storage.get fails', async () => {
      const mockError = new Error('Storage error');
      vi.spyOn(browser.storage.sync, 'get').mockRejectedValueOnce(mockError);

      await expect(getStorageItem('key')).rejects.toThrow();
    });

    it('should throw error when storage.set fails', async () => {
      const mockError = new Error('Storage error');
      vi.spyOn(browser.storage.sync, 'set').mockRejectedValueOnce(mockError);

      await expect(setStorageItem('key', 'value')).rejects.toThrow();
    });

    it('should throw error when storage.remove fails', async () => {
      const mockError = new Error('remove error');
      vi.spyOn(browser.storage.sync, 'remove').mockRejectedValueOnce(mockError);
      await expect(removeStorageItems('key')).rejects.toThrow();
    });

    it('should throw error when storage.clear fails', async () => {
      const mockError = new Error('clear error');
      vi.spyOn(browser.storage.sync, 'clear').mockRejectedValueOnce(mockError);
      await expect(clearStorage()).rejects.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete get-set-get cycle', async () => {
      // Set initial value
      await setStorageItem('cycleKey', 'initial');

      // Get value
      let value = await getStorageItem<string>('cycleKey');
      expect(value).toBe('initial');

      // Update value
      await setStorageItem('cycleKey', 'updated');

      // Get updated value
      value = await getStorageItem<string>('cycleKey');
      expect(value).toBe('updated');
    });

    it('should maintain data integrity across multiple operations', async () => {
      const profile = {
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      // Set profile
      await setStorageItem('userProfile', profile);

      // Set additional data
      await setStorageItems({
        lastLogin: '2024-01-01',
        sessionId: 'abc123',
      });

      // Retrieve all data
      const allData = await getMultipleStorageItems<any>([
        'userProfile',
        'lastLogin',
        'sessionId',
      ]);

      expect(allData.userProfile).toEqual(profile);
      expect(allData.lastLogin).toBe('2024-01-01');
      expect(allData.sessionId).toBe('abc123');
    });

    it('should remove keys and clear storage', async () => {
      await setStorageItems({ a: 1, b: 2 });
      await removeStorageItems(['a']);
      let data = await browser.storage.sync.get(null);
      expect(data).toEqual({ b: 2 });

      await clearStorage();
      data = await browser.storage.sync.get(null);
      expect(data).toEqual({});
    });
  });
});
