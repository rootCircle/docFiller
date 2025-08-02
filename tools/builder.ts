import * as esbuild from 'esbuild';
import fs from 'fs-extra';
import copyContents from './copier';
import entryPoints from './entrypoints';
import { writeManifest } from './manifestWriter';

const cleanBuildFolder = async () => {
  try {
    await fs.remove('./build');
    await fs.ensureDir('./build');
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.log('Build folder cleaned and recreated.');
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.error('Error cleaning build folder:', error);
    throw error;
  }
};
const build = async (watch: boolean) => {
  const entrypoints = await entryPoints();
  await copyContents('./public', './build');
  if (watch) {
    const buildContext = await esbuild.context({
      entryPoints: entrypoints,
      bundle: true,
      // minify: true,
      outdir: './build/src',
    });
    await buildContext.watch();
  } else {
    const buildStatus = await esbuild.build({
      entryPoints: entrypoints,
      bundle: true,
      // minify: true,
      outdir: './build/src',
    });

    if (buildStatus.errors.length > 0) {
      // biome-ignore lint/suspicious/noConsole: build script output for development
      console.error('Build failed');
      for (const message of buildStatus.errors) {
        // biome-ignore lint/suspicious/noConsole: build script output for development
        console.error(message.text);
      }
      throw new Error('Error building the ts files!');
    }

    if (buildStatus.warnings.length > 0) {
      // biome-ignore lint/suspicious/noConsole: build script output for development
      console.warn('Build completed with warnings');
      for (const message of buildStatus.warnings) {
        // biome-ignore lint/suspicious/noConsole: build script output for development
        console.warn(message.text);
      }
    }
  }
};

const runBuild = async (watch: boolean) => {
  try {
    if (!watch) {
      await cleanBuildFolder();
    }
    await writeManifest();
    await build(watch);
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.log('Build completed successfully.');
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: build script output for development
    console.error('Build failed:', error);
  }
};

export { runBuild };
