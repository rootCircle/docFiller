import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import fs from 'fs-extra';
import type { Manifest } from 'webextension-polyfill';

import type PkgType from '../package.json';

const r = (...args: string[]) => {
  return resolve(fileURLToPath(new URL('..', import.meta.url)), ...args);
};

const CHROMIUM_BASED = ['chrome', 'chromium', 'edge', 'brave', 'opera'];
const FIREFOX_BASED = ['firefox'];

export async function getManifest() {
  if (!(await fs.pathExists(r('package.json')))) {
    throw new Error('package.json not found');
  }

  const pkg = (await fs.readJSON(r('package.json'))) as typeof PkgType;
  const targetBrowser = process.env['BROWSER'];
  if (!targetBrowser) {
    throw new Error('BROWSER environment variable must be set');
  }
  const isFirefoxBased = FIREFOX_BASED.includes(targetBrowser);
  const isChromiumBased = CHROMIUM_BASED.includes(targetBrowser);
  if (!isFirefoxBased && !isChromiumBased) {
    throw new Error(
      `Unsupported or unspecified browser: ${targetBrowser}. Supported browsers: ${[...CHROMIUM_BASED, ...FIREFOX_BASED].join(', ')}`,
    );
  }
  if (isFirefoxBased && isChromiumBased) {
    throw new Error(
      'Both Firefox and Chromium based browsers are specified. Please specify only one.',
    );
  }

  const baseManifest: Omit<Manifest.WebExtensionManifest, 'background'> = {
    manifest_version: 3,
    name: 'docFiller',
    version: pkg.version,
    description: pkg.description,
    homepage_url: 'https://github.com/rootCircle/docFiller',
    icons: {
      '64': 'assets/icons/icon-form-64.png',
      '96': 'assets/icons/icon-form-96.png',
    },
    author: 'rootCircle',
    permissions: ['activeTab', 'storage'],
    host_permissions: [
      'http://docs.google.com/forms/d/e/*/viewform',
      'https://docs.google.com/forms/d/e/*/viewform',
    ],
    action: {
      default_popup: 'src/popup/index.html',
      default_title: 'docFiller',
    },
    options_ui: {
      page: 'src/options/index.html',
      open_in_tab: true,
    },
    content_scripts: [
      {
        matches: [
          'http://docs.google.com/forms/*',
          'https://docs.google.com/forms/*',
        ],
        js: ['src/contentScript/index.js'],
      },
    ],
  };

  const manifest: Manifest.WebExtensionManifest = {
    ...baseManifest,
    ...(isFirefoxBased && {
      developer: {
        name: 'rootCircle',
        url: 'https://github.com/rootCircle',
      },
    }),
    background: (() => {
      if (isFirefoxBased) {
        return { scripts: ['src/background/index.js'] };
      }
      if (isChromiumBased) {
        return { service_worker: 'src/background/index.js' };
      }
      throw new Error('Unsupported browser type');
    })(),
    browser_specific_settings: {
      ...(isFirefoxBased && {
        gecko: {
          id: 'docFiller@rootcircle.github.io',
          strict_min_version: '109.0',
        },
        gecko_android: {
          strict_min_version: '120.0',
        },
      }),
    },
  };

  return manifest;
}
