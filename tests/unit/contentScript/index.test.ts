import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const runDocFillerEngineMock = vi.fn();
vi.mock('@docFillerCore/index', () => ({
  runDocFillerEngine: runDocFillerEngineMock,
}));

const isFillFormMessageMock = vi.fn();
vi.mock('@utils/messageTypes', () => ({
  isFillFormMessage: (message: unknown) => isFillFormMessageMock(message),
}));

const getIsEnabledMock = vi.fn();
vi.mock('@utils/storage/getProperties', () => ({
  getIsEnabled: (...args: unknown[]) => getIsEnabledMock(...args),
}));

const disposeMock = vi.fn();
vi.mock('@docFillerCore/engines/consensusEngine', () => ({
  ConsensusEngine: {
    dispose: disposeMock,
  },
}));

describe('contentScript/index', () => {
  let messageListeners: Array<
    (
      message: unknown,
      sender: browser.Runtime.MessageSender,
    ) => Promise<unknown> | unknown
  > = [];
  const windowHandlers: Record<string, EventListenerOrEventListenerObject[]> =
    {};

  beforeEach(async () => {
    vi.resetModules();
    messageListeners = [];
    Object.keys(windowHandlers).forEach((key) => delete windowHandlers[key]);

    browser.runtime.onMessage.addListener = (callback: any) => {
      messageListeners.push(callback);
      return undefined as any;
    };

    window.addEventListener = vi.fn((type: string, handler: any) => {
      if (!windowHandlers[type]) {
        windowHandlers[type] = [];
      }
      windowHandlers[type]?.push(handler);
    }) as any;

    getIsEnabledMock.mockResolvedValue(true);
    isFillFormMessageMock.mockImplementation(
      (message) => (message as { action?: string })?.action === 'fillForm',
    );

    runDocFillerEngineMock.mockResolvedValue(undefined);
    await import('@contentScript/index');
  });

  afterEach(() => {
    vi.clearAllMocks();
    runDocFillerEngineMock.mockReset();
  });

  it('runs the doc filler engine when enabled on load', async () => {
    await Promise.resolve();
    expect(runDocFillerEngineMock).toHaveBeenCalled();
  });

  it('handles fill form messages and returns success', async () => {
    const response = await messageListeners[0]?.({
      action: 'fillForm',
    });

    expect(runDocFillerEngineMock).toHaveBeenCalledTimes(2);
    expect(response).toEqual({ success: true });
  });

  it('ignores unrelated messages', async () => {
    const response = await messageListeners[0]?.({ action: 'noop' });
    expect(response).toBeUndefined();
  });

  it('disposes consensus engine on beforeunload', async () => {
    const handlers = windowHandlers['beforeunload'] ?? [];
    expect(handlers).toHaveLength(1);
    const handler = handlers[0];
    if (typeof handler === 'function') {
      handler(new Event('beforeunload'));
    } else if (handler && 'handleEvent' in handler && handler.handleEvent) {
      handler.handleEvent(new Event('beforeunload'));
    }
    expect(disposeMock).toHaveBeenCalled();
  });
});



