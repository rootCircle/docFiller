import browser from 'webextension-polyfill';

/**
 * Sends a message via a long-lived port connection to prevent the background script
 * from going idle during long-running tasks (like slow local LLM execution).
 *
 * @param portName The name of the port to connect to.
 * @param message The message object to send.
 * @returns The resolved value from the background script, or null if an error occurred.
 */
export function sendLongLivedMessage<T = unknown>(
  portName: string,
  // biome-ignore lint/suspicious/noExplicitAny: Message can be any serializable object
  message: any,
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let port: browser.Runtime.Port | null = null;
    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

    try {
      port = browser.runtime.connect({ name: portName });
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: debugging
      console.error(`Error connecting to port ${portName}:`, err);
      resolve(null);
      return;
    }

    const cleanup = () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      try {
        port?.disconnect();
      } catch {
        // ignore
      }
      port = null;
    };

    // Send a ping every 3 seconds to prevent background page from sleeping
    keepAliveInterval = setInterval(() => {
      try {
        port?.postMessage({ type: 'PING' });
      } catch {
        cleanup();
      }
    }, 3000);

    port.onMessage.addListener((rawResponse: unknown) => {
      const response = rawResponse as {
        type?: string;
        value?: T;
        error?: unknown;
      };

      if (response?.type === 'PONG') {
        return; // Ignore keep-alive acknowledgments
      }

      cleanup();

      if (!response || typeof response !== 'object') {
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error('Invalid response from background via port');
        resolve(null);
        return;
      }

      if (response.error) {
        const errorMessage =
          typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response.error);
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error(new Error(errorMessage));
        resolve(null);
        return;
      }

      resolve(response.value ?? null);
    });

    port.onDisconnect.addListener(() => {
      const runtimeError = browser.runtime.lastError;
      if (runtimeError) {
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error('Port disconnected with error:', runtimeError);
      }
      cleanup();
      resolve(null);
    });

    try {
      port.postMessage(message);
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: debugging
      console.error('Error sending message via port:', err);
      cleanup();
      resolve(null);
    }
  });
}

/**
 * Sets up a listener for long-lived port connections, handling keep-alive pings automatically
 * and providing a clean interface for processing async messages.
 *
 * @param portName The name of the port to listen for.
 * @param handler A function that takes the incoming message and returns a Promise with the response.
 */
export function setupLongLivedPortListener(
  portName: string,
  // biome-ignore lint/suspicious/noExplicitAny: Message and response can be any serializable object
  handler: (message: any) => Promise<any>,
) {
  browser.runtime.onConnect.addListener((port: browser.Runtime.Port) => {
    if (port.name !== portName) {
      return;
    }

    port.onMessage.addListener(async (message: unknown) => {
      const typedMessage = message as { type?: string };

      if (typedMessage.type === 'PING') {
        // Respond to ping to keep the channel and background script alive
        port.postMessage({ type: 'PONG' });
        return;
      }

      try {
        const response = await handler(message);
        if (response !== undefined) {
          port.postMessage({ value: response });
        }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error(`Error handling message on port ${portName}:`, error);
        port.postMessage({
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });
  });
}
