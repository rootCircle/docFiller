import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { runDocFillerEngine } from '@docFillerCore/index';
import { isFillFormMessage, type MessageResponse } from '@utils/messageTypes';
import { getIsEnabled } from '@utils/storage/getProperties';

chrome.runtime.onMessage.addListener(
  (
    message: unknown,

    _sender: chrome.runtime.MessageSender,

    sendResponse: (response: MessageResponse) => void,
  ) => {
    if (isFillFormMessage(message)) {
      void runDocFillerEngine()
        .then(() => {
          sendResponse({ success: true });
        })

        .catch((error: Error) => {
          // biome-ignore lint/suspicious/noConsole: debugging error in content script
          console.error('Error running doc filler:', error);

          sendResponse({
            success: false,

            error: error.message || 'Failed to fill document',
          });
        });

      return true;
    }

    return false;
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
