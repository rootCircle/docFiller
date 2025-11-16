import { vi } from 'vitest';

/**
 * Mock implementation of browser.storage.sync for testing
 */
class MockStorage {
  private store: Record<string, any> = {};

  get = vi.fn(async (keys: string | string[] | null) => {
    if (keys === null) {
      return { ...this.store };
    }
    if (typeof keys === 'string') {
      return { [keys]: this.store[keys] };
    }
    const result: Record<string, any> = {};
    for (const key of keys) {
      if (key in this.store) {
        result[key] = this.store[key];
      }
    }
    return result;
  });

  set = vi.fn(async (items: Record<string, any>) => {
    Object.assign(this.store, items);
  });

  remove = vi.fn(async (keys: string | string[]) => {
    const keysArray = typeof keys === 'string' ? [keys] : keys;
    for (const key of keysArray) {
      delete this.store[key];
    }
  });

  clear = vi.fn(async () => {
    this.store = {};
  });

  // Helper method for tests to access store directly
  _getStore() {
    return this.store;
  }

  // Helper method for tests to reset store
  _reset() {
    this.store = {};
    this.get.mockClear();
    this.set.mockClear();
    this.remove.mockClear();
    this.clear.mockClear();
  }
}

/**
 * Mock implementation of browser.runtime for testing
 */
const mockRuntime = {
  sendMessage: vi.fn(async (message: any) => {
    return { success: true };
  }),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
  onInstalled: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onStartup: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  id: 'mock-extension-id',
};

/**
 * Mock implementation of browser.tabs for testing
 */
const mockTabs = {
  query: vi.fn(async () => []),
  sendMessage: vi.fn(async () => ({ success: true })),
  reload: vi.fn(async () => undefined),
  create: vi.fn(async (options) => ({
    id: 1,
    index: 0,
    highlighted: true,
    active: true,
    pinned: false,
    url: options.url,
    incognito: false,
  })),
};

/**
 * Complete browser API mock
 */
export const mockBrowser = {
  storage: {
    sync: new MockStorage(),
    local: new MockStorage(),
  },
  runtime: mockRuntime,
  tabs: mockTabs,
};

/**
 * Reset all mocks - call this in beforeEach
 */
export function resetBrowserMocks() {
  (mockBrowser.storage.sync as MockStorage)._reset();
  (mockBrowser.storage.local as MockStorage)._reset();
  mockRuntime.sendMessage.mockClear();
  mockRuntime.onMessage.addListener.mockClear();
  mockRuntime.onInstalled.addListener.mockClear();
  mockRuntime.onStartup.addListener.mockClear();
  mockTabs.query.mockClear();
  mockTabs.sendMessage.mockClear();
  mockTabs.reload.mockClear();
  mockTabs.create.mockClear();
}
