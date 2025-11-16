import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetBrowserMocks } from '../../mocks/browser.mock';

const invokeMagicMock = vi.fn();
const invokeLLMMock = vi.fn();

vi.mock('@docFillerCore/engines/gptEngine', () => ({
  LLMEngine: class {
    constructor(public model: string) {}

    async invokeMagicLLM(questions: string[]) {
      return invokeMagicMock(questions);
    }

    async invokeLLM(prompt: string, questionType: string) {
      return invokeLLMMock(prompt, questionType);
    }
  },
}));

const getMetricsMock = vi.fn();
vi.mock('@utils/storage/metricsManager', () => ({
  MetricsManager: {
    getInstance: vi.fn(() => ({
      getMetrics: getMetricsMock,
    })),
  },
}));

describe('background/index', () => {
  let messageListeners: Array<
    (
      message: unknown,
      sender: browser.Runtime.MessageSender,
    ) => Promise<unknown> | unknown
  > = [];
  let installedListeners: Array<() => void> = [];
  let startupListeners: Array<() => void> = [];

  beforeEach(async () => {
    vi.resetModules();
    resetBrowserMocks();
    invokeMagicMock.mockReset();
    invokeLLMMock.mockReset();
    getMetricsMock.mockReset();
    messageListeners = [];
    installedListeners = [];
    startupListeners = [];

    (
      browser.runtime.onMessage.addListener as unknown as vi.Mock
    ).mockImplementation((callback: any) => {
      messageListeners.push(callback);
    });
    (
      browser.runtime.onInstalled.addListener as unknown as vi.Mock
    ).mockImplementation((callback: any) => {
      installedListeners.push(callback);
    });
    (
      browser.runtime.onStartup.addListener as unknown as vi.Mock
    ).mockImplementation((callback: any) => {
      startupListeners.push(callback);
    });

    await import('@background/index');
  });

  afterEach(() => {
    (browser.runtime.onMessage.addListener as vi.Mock).mockReset();
    (browser.runtime.onInstalled.addListener as vi.Mock).mockReset();
    (browser.runtime.onStartup.addListener as vi.Mock).mockReset();
  });

  it('preloads metrics on installation', async () => {
    expect(installedListeners).toHaveLength(1);
    await installedListeners[0]?.();
    expect(getMetricsMock).toHaveBeenCalled();
  });

  it('handles MAGIC_PROMPT_GEN messages', async () => {
    invokeMagicMock.mockResolvedValueOnce({ system_prompt: 'magic' });
    const listener = messageListeners.at(-1)!;
    const response = await listener({
      type: 'MAGIC_PROMPT_GEN',
      questions: ['Q1'],
      model: 'gpt-4.1-mini',
    });

    expect(invokeMagicMock).toHaveBeenCalledWith(['Q1']);
    expect(response).toEqual({ value: { system_prompt: 'magic' } });
  });

  it('handles API_CALL messages', async () => {
    invokeLLMMock.mockResolvedValueOnce({ text: 'llm' });
    const listener = messageListeners.at(-1)!;
    const response = await listener({
      type: 'API_CALL',
      prompt: 'Hello',
      questionType: 'TEXT',
      model: 'gpt-4.1-mini',
    });

    expect(invokeLLMMock).toHaveBeenCalledWith('Hello', 'TEXT');
    expect(response).toEqual({ value: { text: 'llm' } });
  });

  it('ignores unknown message types', async () => {
    const listener = messageListeners.at(-1)!;
    const response = await listener({ type: 'UNKNOWN' });
    expect(response).toBeUndefined();
  });
});
