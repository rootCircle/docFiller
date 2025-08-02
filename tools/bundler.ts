import { runBuild } from './builder';

// biome-ignore lint/suspicious/noConsole: build script error handling
runBuild(false).catch(console.error);
