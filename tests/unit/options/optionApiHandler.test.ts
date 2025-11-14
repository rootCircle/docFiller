import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  updateApiKeyInputField,
  updateApiKeyLink,
  updateConsensusApiLink,
  updateConsensusApiLinks,
} from '@options/optionApiHandler';

const getModelTypeFromNameMock = vi.fn();
const getModelNameMock = vi.fn();
const getSourceLinkMock = vi.fn();

vi.mock('@utils/llmEngineTypes', () => ({
  getModelTypeFromName: (...args: unknown[]) => getModelTypeFromNameMock(...args),
  getModelName: (...args: unknown[]) => getModelNameMock(...args),
  getAPIPlatformSourceLink: (...args: unknown[]) => getSourceLinkMock(...args),
  LLMEngineType: {
    ChatGPT: 'gpt-4.1-mini',
    Gemini: 'gemini-2.5-flash-lite',
    Ollama: 'qwen3:4b',
    ChromeAI: 'chrome-gemini-nano',
    Mistral: 'mistral-large-latest',
    Anthropic: 'claude-4-sonnet-latest',
  },
}));

const modelNameMap: Record<string, string> = {
  'gpt-4.1-mini': 'ChatGPT',
  'gemini-2.5-flash-lite': 'Gemini',
  'qwen3:4b': 'Ollama',
  'chrome-gemini-nano': 'ChromeAI',
  'mistral-large-latest': 'Mistral',
  'claude-4-sonnet-latest': 'Anthropic',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  ollama: 'Ollama',
  chromeAI: 'ChromeAI',
  mistral: 'Mistral',
  anthropic: 'Anthropic',
};

const typeMap: Record<string, string> = {
  ChatGPT: 'gpt-4.1-mini',
  Gemini: 'gemini-2.5-flash-lite',
  Ollama: 'qwen3:4b',
  ChromeAI: 'chrome-gemini-nano',
  Mistral: 'mistral-large-latest',
  Anthropic: 'claude-4-sonnet-latest',
};

type ApiField = {
  input: HTMLInputElement;
  toggle: HTMLElement;
  anchor: HTMLAnchorElement;
  wrapper: HTMLElement;
};

const insertApiField = (id: string): ApiField => {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const input = document.createElement('input');
  input.id = id;
  wrapper.appendChild(input);
  const toggle = document.createElement('button');
  toggle.className = 'password-toggle';
  toggle.style.display = 'none';
  wrapper.appendChild(toggle);
  const link = document.createElement('a');
  link.style.display = 'none';
  container.appendChild(wrapper);
  container.appendChild(link);
  document.body.appendChild(container);
  return { input, toggle, anchor: link, wrapper };
};

describe('optionApiHandler', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  beforeEach(() => {
    getModelNameMock.mockImplementation((type: string) => modelNameMap[type] ?? type);
    getModelTypeFromNameMock.mockImplementation((name: string) => typeMap[name] ?? null);
    getSourceLinkMock.mockReturnValue('https://example.com/key');
  });

  it('shows API link when provider has a URL', () => {
    const select = document.createElement('select');
    select.value = 'ChatGPT';
    const anchor = document.createElement('a');
    const warning = document.createElement('div');
    warning.className = 'warning-message';
    warning.style.display = 'none';
    document.body.appendChild(anchor);
    document.body.appendChild(warning);

    getModelTypeFromNameMock.mockReturnValueOnce(typeMap.ChatGPT);
    getSourceLinkMock.mockReturnValueOnce('https://docs');

    updateApiKeyLink(select, anchor);

    expect(anchor.href).toContain('https://docs');
    expect(anchor.style.display).toBe('block');
    expect(warning.style.display).toBe('none');
  });

  it('shows warning when provider lacks API link', () => {
    const select = document.createElement('select');
    select.value = 'Ollama';
    const anchor = document.createElement('a');
    anchor.style.display = 'block';
    const warning = document.createElement('div');
    warning.className = 'warning-message';
    warning.style.display = 'none';
    document.body.appendChild(anchor);
    document.body.appendChild(warning);

    getModelTypeFromNameMock.mockReturnValueOnce(typeMap.Ollama);
    getSourceLinkMock.mockReturnValueOnce('');

    updateApiKeyLink(select, anchor);

    expect(anchor.style.display).toBe('none');
    expect(warning.style.display).toBe('block');
  });

  it('shows consensus section and populates links when enabled', () => {
    const section = document.createElement('div');
    section.id = 'consensusWeights';
    section.className = 'hidden';
    document.body.appendChild(section);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;

    insertApiField('chatGptApiKey');
    insertApiField('geminiApiKey');
    insertApiField('ollamaApiKey');
    insertApiField('chromeAIApiKey');
    insertApiField('mistralApiKey');
    insertApiField('anthropicApiKey');

    updateConsensusApiLinks(checkbox);

    expect(section.classList.contains('hidden')).toBe(false);
  });

  it('enables input and sets link for consensus model', () => {
    const { input, anchor } = insertApiField('chatGptApiKey');

    getModelTypeFromNameMock.mockReturnValueOnce(typeMap.ChatGPT);
    getSourceLinkMock.mockReturnValueOnce('https://key');

    updateConsensusApiLink('chatGptApiKey', 'ChatGPT');

    expect(input.disabled).toBe(false);
    expect(anchor.href).toContain('https://key');
    expect(anchor.style.display).toBe('block');
    expect(input.nextElementSibling).not.toBeNull();
  });

  it('disables API input for Ollama/ChromeAI models', () => {
    const { input, toggle, wrapper } = insertApiField('singleApiKey');
    const select = document.createElement('select');
    const label = modelNameMap[typeMap.Ollama];
    const option = document.createElement('option');
    option.value = label;
    option.textContent = label;
    select.appendChild(option);
    select.value = label;

    updateApiKeyInputField(input, select as HTMLSelectElement);

    expect(getModelNameMock).toHaveBeenCalledWith(typeMap.Ollama);
    expect(input.disabled).toBe(true);
    expect(wrapper.classList.contains('warning')).toBe(true);
    expect(toggle.classList.contains('hidden')).toBe(true);
  });
});

