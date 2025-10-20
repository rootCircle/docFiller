import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { runDocFillerEngine } from '@docFillerCore/index';
import { isFillFormMessage } from '@utils/messageTypes';
import { getIsEnabled } from '@utils/storage/getProperties';
import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener(
  async (
    message: unknown,

    _sender: browser.Runtime.MessageSender,
  ) => {
    if (isFillFormMessage(message)) {
      try {
        await runDocFillerEngine();
        return { success: true };
      } catch (error: unknown) {
        // biome-ignore lint/suspicious/noConsole: debugging error in content script
        console.error('Error running doc filler:', error);

        return {
          success: false,

          error:
            error instanceof Error ? error.message : 'Failed to fill document',
        };
      }
    }

    return undefined;
  },
);

getIsEnabled()
  .then((isEnabled) => {
    if (isEnabled === true) {
      // biome-ignore lint/suspicious/noConsole: error handling for background doc filler engine
      runDocFillerEngine().catch(console.error);
    } else {
      // biome-ignore lint/suspicious/noConsole: debugging info when extension is disabled
      console.log('Doc Filler is currently disabled');
    }
    return Promise.resolve();
  })
  // biome-ignore lint/suspicious/noConsole: error handling for main extension flow
  .catch(console.error);

// Clean up ConsensusEngine when the page is about to unload
window.addEventListener('beforeunload', () => {
  ConsensusEngine.dispose();
});
