import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const r = (...args: string[]) => {
  return resolve(fileURLToPath(new URL('..', import.meta.url)), ...args);
};

export async function writeManifest() {
  const browser = process.env.BROWSER;
  if (!browser) {
    throw new Error('BROWSER environment variable must be set');
  }

  try {
    await fs.ensureDir(r('build'));

    // Dynamically import the manifest to avoid caching
    const { getManifest } = await import('../public/manifest.js');
    const manifest = await getManifest();

    let existingManifest = null;
    try {
      existingManifest = await fs.readJSON(r('build/manifest.json'));
    } catch (_error) {
      // File doesn't exist yet, that's fine
    }

    if (JSON.stringify(existingManifest) !== JSON.stringify(manifest)) {
      await fs.writeJSON(r('build/manifest.json'), manifest, { spaces: 2 });
      // biome-ignore lint/suspicious/noConsole: build script output for development
      console.log(`✓ manifest.json updated for ${browser}`);
    } else {
      // biome-ignore lint/suspicious/noConsole: build script output for development
      console.log('No changes detected in manifest content');
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: build script error output
    console.error('Error writing manifest:', error);
    throw error;
  }
}

if (require.main === module) {
  // biome-ignore lint/suspicious/noConsole: build script error handling
  writeManifest().catch(console.error);
}
