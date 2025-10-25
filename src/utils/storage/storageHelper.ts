/**
 * Centralized browser storage utility functions using webextension-polyfill
 * Provides consistent error handling and type safety across the extension
 */

import browser from 'webextension-polyfill';

/**
 * Generic function to get a single item from browser storage
 */
export async function getStorageItem<T>(key: string): Promise<T | undefined> {
  try {
    const result = await browser.storage.sync.get([key]);
    return result[key] as T;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : `Failed to get ${key}`,
    );
  }
}

/**
 * Generic function to set multiple items in browser storage
 */
export async function setStorageItems(
  items: Record<string, unknown>,
): Promise<void> {
  try {
    await browser.storage.sync.set(items);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to save to storage',
    );
  }
}

/**
 * Generic function to set a single item in browser storage
 */
export function setStorageItem<T>(key: string, value: T): Promise<void> {
  return setStorageItems({ [key]: value });
}

/**
 * Generic function to get multiple items from browser storage
 */
export async function getMultipleStorageItems<
  T extends Record<string, unknown>,
>(keys: string[]): Promise<T> {
  try {
    const result = await browser.storage.sync.get(keys);
    return result as T;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to get keys: ${keys.join(', ')}`,
    );
  }
}

/**
 * Generic function to remove items from browser storage
 */
export async function removeStorageItems(
  keys: string | string[],
): Promise<void> {
  try {
    await browser.storage.sync.remove(keys);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to remove from storage',
    );
  }
}

/**
 * Generic function to clear all browser storage
 */
export async function clearStorage(): Promise<void> {
  try {
    await browser.storage.sync.clear();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to clear storage',
    );
  }
}
