/**
 * Centralized Chrome storage utility functions
 * Provides consistent error handling and type safety across the extension
 */

/**
 * Generic function to get a single item from Chrome storage
 */
export function getStorageItem<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message || `Failed to get ${key}`,
          ),
        );
      } else {
        resolve(result[key] as T);
      }
    });
  });
}

/**
 * Generic function to set multiple items in Chrome storage
 */
export function setStorageItems(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message || 'Failed to save to storage',
          ),
        );
      } else {
        resolve();
      }
    });
  });
}

/**
 * Generic function to set a single item in Chrome storage
 */
export function setStorageItem<T>(key: string, value: T): Promise<void> {
  return setStorageItems({ [key]: value });
}

/**
 * Generic function to get multiple items from Chrome storage
 */
export function getMultipleStorageItems<T extends Record<string, unknown>>(
  keys: string[],
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message ||
              `Failed to get keys: ${keys.join(', ')}`,
          ),
        );
      } else {
        resolve(result as T);
      }
    });
  });
}

/**
 * Generic function to remove items from Chrome storage
 */
export function removeStorageItems(keys: string | string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message ||
              'Failed to remove from storage',
          ),
        );
      } else {
        resolve();
      }
    });
  });
}

/**
 * Generic function to clear all Chrome storage
 */
export function clearStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError?.message || 'Failed to clear storage',
          ),
        );
      } else {
        resolve();
      }
    });
  });
}
