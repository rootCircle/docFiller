import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/build/**',
      '**/tests/e2e/**',  // E2E tests run with Playwright
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'build/**',
        'web-ext-artifacts/**',
        'tests/**',
        '**/*.config.ts',
        '**/*.d.ts',
        'tools/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@docFillerCore': path.resolve(__dirname, './src/docFillerCore'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@background': path.resolve(__dirname, './src/background'),
      '@contentScript': path.resolve(__dirname, './src/contentScript'),
      '@popup': path.resolve(__dirname, './src/popup'),
      '@options': path.resolve(__dirname, './src/options'),
    },
  },
});
