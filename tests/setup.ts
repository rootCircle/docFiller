import { vi } from 'vitest';
import { mockBrowser } from './mocks/browser.mock';

// Setup global browser mock BEFORE any imports
global.browser = mockBrowser as any;

// Mock webextension-polyfill module
vi.mock('webextension-polyfill', () => ({
  default: mockBrowser,
  browser: mockBrowser,
}));

// Mock console methods to avoid noise in tests (optional)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
