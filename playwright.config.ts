import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests serially for extension tests
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1, // Use single worker for extension tests
  reporter: 'html',
  timeout: 120000, // 120 seconds per test (form filling with real API takes time)

  use: {
    headless: false, // Extensions require headed mode
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000, // 30 seconds for actions (API calls take time)
    navigationTimeout: 30000, // 30 seconds for navigation
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Record video of failed tests
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // channel is set in extension-fixture.ts for launchPersistentContext
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
  
  // No web server needed for extension tests
});

