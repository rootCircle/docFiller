import {
  test as base,
  chromium,
  firefox,
  type BrowserContext,
} from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({ browserName }, use) => {
    const pathToExtension = path.join(__dirname, '../../../build');

    console.log('Extension path:', pathToExtension);
    console.log('Browser name:', browserName);

    const manifestPath = path.join(pathToExtension, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(
        `Extension manifest not found at ${manifestPath}. Run 'npm run build:chromium' first.`,
      );
    }
    console.log('✅ Extension manifest found');

    let context: BrowserContext;

    if (browserName === 'chromium') {
      const absoluteExtensionPath = path.resolve(pathToExtension);
      console.log('Absolute extension path:', absoluteExtensionPath);

      const userDataDir = path.join(__dirname, '../../../.test-user-data');

      const launchArgs = [
        `--disable-extensions-except=${absoluteExtensionPath}`,
        `--load-extension=${absoluteExtensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ];

      console.log('Launch args:', launchArgs);

      // Using Playwright's bundled Chromium for consistent extension loading behavior
      context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: launchArgs,
        viewport: { width: 1280, height: 720 },
        timeout: 30000,
      });
      console.log('✅ Launched with Playwright Chromium');
      console.log('✅ Chrome context created with extension loaded');

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (browserName === 'firefox') {
      const userDataDir = path.join(
        __dirname,
        '../../../.test-user-data-firefox',
      );

      context = await firefox.launchPersistentContext(userDataDir, {
        headless: false,
      });

      console.warn('Firefox extension loading not fully implemented yet');
    } else {
      throw new Error(`Unsupported browser: ${browserName}`);
    }

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let extensionId = '';

    try {
      console.log('Starting to detect extension ID...');

      // Cache ID across test runs to avoid re-detection
      const savedIdPath = path.join(__dirname, '../.extension-id');
      if (fs.existsSync(savedIdPath)) {
        const savedId = fs.readFileSync(savedIdPath, 'utf-8').trim();
        if (savedId && /^[a-z]{32}$/.test(savedId)) {
          extensionId = savedId;
          console.log('✅ Using cached extension ID:', extensionId);
          await use(extensionId);
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Checking for extension workers...');
      const tempPage = await context.newPage();

      let workers = context.serviceWorkers();
      let bgPages = context.backgroundPages();

      console.log(
        `Service workers: ${workers.length}, Background pages: ${bgPages.length}`,
      );

      if (workers.length > 0) {
        const swUrl = workers[0].url();
        const match = swUrl.match(/chrome-extension:\/\/([a-z]{32})/);
        if (match) {
          extensionId = match[1];
          console.log(
            '✅ Found extension ID from service worker:',
            extensionId,
          );
          fs.writeFileSync(savedIdPath, extensionId);
          await tempPage.close();
          await use(extensionId);
          return;
        }
      }

      if (bgPages.length > 0) {
        const bgUrl = bgPages[0].url();
        const match = bgUrl.match(/chrome-extension:\/\/([a-z]{32})/);
        if (match) {
          extensionId = match[1];
          console.log(
            '✅ Found extension ID from background page:',
            extensionId,
          );
          fs.writeFileSync(savedIdPath, extensionId);
          await tempPage.close();
          await use(extensionId);
          return;
        }
      }

      // MV3 service workers are lazy - use CDP to trigger detection
      console.log('Trying CDP detection...');
      try {
        const client = await tempPage.context().newCDPSession(tempPage);
        await client.send('Target.setDiscoverTargets', { discover: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const targets = await client.send('Target.getTargets');

        for (const target of (targets as any).targetInfos || []) {
          if (target.url?.startsWith('chrome-extension://')) {
            const match = target.url.match(/chrome-extension:\/\/([a-z]{32})/);
            if (match) {
              extensionId = match[1];
              console.log('✅ Found extension ID from CDP:', extensionId);
              fs.writeFileSync(savedIdPath, extensionId);
              await tempPage.close();
              await use(extensionId);
              return;
            }
          }
        }
      } catch (e) {
        console.log('CDP detection failed:', e);
      }

      console.log('Final attempt: navigating to example.com...');
      await tempPage
        .goto('https://example.com', {
          waitUntil: 'domcontentloaded',
          timeout: 5000,
        })
        .catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 1000));

      workers = context.serviceWorkers();
      bgPages = context.backgroundPages();

      if (workers.length > 0) {
        const swUrl = workers[0].url();
        const match = swUrl.match(/chrome-extension:\/\/([a-z]{32})/);
        if (match) {
          extensionId = match[1];
          console.log('✅ Found extension ID from final check:', extensionId);
          fs.writeFileSync(savedIdPath, extensionId);
        }
      } else if (bgPages.length > 0) {
        const bgUrl = bgPages[0].url();
        const match = bgUrl.match(/chrome-extension:\/\/([a-z]{32})/);
        if (match) {
          extensionId = match[1];
          console.log('✅ Found extension ID from final check:', extensionId);
          fs.writeFileSync(savedIdPath, extensionId);
        }
      }

      await tempPage.close();

      console.log('Final Extension ID:', extensionId);

      if (!extensionId) {
        console.warn(
          '⚠️  Extension ID not detected automatically. Some tests requiring the extension ID may be skipped.',
        );
        console.warn('To get the extension ID:');
        console.warn('1. Look at chrome://extensions in the test browser');
        console.warn('2. Copy the extension ID');
        console.warn('3. Save it to: tests/e2e/.extension-id');
      }
    } catch (error) {
      console.error('Error getting extension ID:', error);
      throw error;
    }

    await use(extensionId);
  },
});

export { expect } from '@playwright/test';

export async function setupMockAPIKeys(
  context: BrowserContext,
  extensionId?: string,
) {
  try {
    console.log('Setting up mock API keys...');

    // Get API key from environment variable
    const geminiApiKey =
      process.env.GEMINI_API_KEY || process.env.TEST_GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.warn(
        '⚠️  No GEMINI_API_KEY environment variable set. Set TEST_GEMINI_API_KEY or GEMINI_API_KEY to run e2e tests.',
      );
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const backgrounds = context.backgroundPages();
    if (backgrounds.length > 0) {
      console.log('Setting API keys via background page');
      const bgPage = backgrounds[0];
      await bgPage.evaluate((apiKey) => {
        return chrome.storage.sync.set({
          geminiApiKey: apiKey,
          llmModel: 'Gemini',
          isEnabled: true,
          enableConsensus: false,
        });
      }, geminiApiKey);
      console.log('✅ API keys set via background page');
      return;
    }

    const workers = context.serviceWorkers();
    if (workers.length > 0) {
      console.log('Setting API keys via service worker');
      const worker = workers[0];
      await worker.evaluate((apiKey) => {
        return chrome.storage.sync.set({
          geminiApiKey: apiKey,
          llmModel: 'Gemini',
          isEnabled: true,
          enableConsensus: false,
        });
      }, geminiApiKey);
      console.log('✅ API keys set via service worker');
      return;
    }

    // Fallback: If neither background page nor service worker is available, use extension page
    if (extensionId) {
      console.log('Setting API keys via extension page');
      const page = await context.newPage();
      await page
        .goto(`chrome-extension://${extensionId}/src/options/index.html`, {
          timeout: 5000,
          waitUntil: 'domcontentloaded',
        })
        .catch(() => {});

      await page
        .evaluate((apiKey) => {
          return chrome.storage.sync.set({
            geminiApiKey: apiKey,
            llmModel: 'Gemini',
            isEnabled: true,
            enableConsensus: false,
          });
        }, geminiApiKey)
        .catch((e) => console.log('Page evaluate failed:', e));

      await page.close();
      console.log('✅ API keys set via extension page');
      return;
    }

    console.warn('⚠️  Could not set up API keys - no access point available');
  } catch (error) {
    console.warn('Could not setup API keys:', error);
  }
}

export async function openExtensionPopup(
  context: BrowserContext,
  extensionId: string,
) {
  if (!extensionId) {
    throw new Error('Extension ID is empty. Cannot open popup.');
  }

  const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`;
  console.log('Opening popup URL:', popupUrl);

  const page = await context.newPage();

  try {
    await page.goto(popupUrl, { timeout: 10000, waitUntil: 'load' });
  } catch (error) {
    console.error('Failed to open popup:', error);
    throw error;
  }

  return page;
}

export async function openExtensionOptions(
  context: BrowserContext,
  extensionId: string,
) {
  if (!extensionId) {
    throw new Error('Extension ID is empty. Cannot open options.');
  }

  const optionsUrl = `chrome-extension://${extensionId}/src/options/index.html`;
  const page = await context.newPage();
  await page.goto(optionsUrl, { timeout: 10000, waitUntil: 'load' });
  return page;
}

export async function mockLLMResponses(context: BrowserContext) {
  await context.route('**/api.openai.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'John Doe',
            },
            finish_reason: 'stop',
          },
        ],
      }),
    });
  });

  // Mock Anthropic API
  await context.route('**/api.anthropic.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-response-id',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'John Doe' }],
        model: 'claude-3-sonnet',
        stop_reason: 'end_turn',
      }),
    });
  });

  // Mock Google Gemini API
  await context.route('**/generativelanguage.googleapis.com/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: 'John Doe' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      }),
    });
  });
}
