#!/usr/bin/env node
/**
 * Helper script to extract Chrome extension ID for testing
 *
 * Usage: node get-extension-id.js
 *
 * This script launches Chrome with the extension loaded and extracts its ID.
 */

import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getExtensionId() {
  const pathToExtension = path.join(__dirname, '../../build');
  const userDataDir = path.join(__dirname, '../../.test-user-data-temp');

  console.log('Loading extension from:', pathToExtension);
  console.log('Using temp user data dir:', userDataDir);

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',
    ],
  });

  console.log('Chrome launched, waiting for extension to load...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Try to find extension ID
  const page = await context.newPage();
  await page
    .goto('chrome://extensions', { waitUntil: 'domcontentloaded' })
    .catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check service workers
  const serviceWorkers = context.serviceWorkers();
  if (serviceWorkers.length > 0) {
    const swUrl = serviceWorkers[0].url();
    const match = swUrl.match(/chrome-extension:\/\/([a-z]{32})/);
    if (match) {
      const id = match[1];
      console.log('\n✅ Extension ID found:', id);

      // Save to file
      const idFilePath = path.join(__dirname, '.extension-id');
      fs.writeFileSync(idFilePath, id);
      console.log('Saved to:', idFilePath);

      await context.close();
      return id;
    }
  }

  console.log('\n❌ Could not automatically detect extension ID');
  console.log('\nManual steps:');
  console.log('1. Chrome window is open with the extension loaded');
  console.log('2. Navigate to chrome://extensions in the browser');
  console.log('3. Enable "Developer mode" (toggle in top right)');
  console.log('4. Find "docFiller" extension');
  console.log('5. Copy the ID (long string of lowercase letters)');
  console.log('6. Save it to: tests/e2e/.extension-id');
  console.log('\n Press Ctrl+C when done');

  await new Promise(() => {}); // Keep running
}

getExtensionId().catch(console.error);
