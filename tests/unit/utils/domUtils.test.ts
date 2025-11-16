import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ifElementExists,
  ifElementsExist,
  requireElementById,
  requireQuerySelector,
  safeGetElementById,
  safeQuerySelector,
} from '@utils/domUtils';

describe('domUtils', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('safely retrieves optional elements', () => {
    const input = document.createElement('input');
    input.id = 'username';
    document.body.appendChild(input);

    expect(safeGetElementById<HTMLInputElement>('username')).toBe(input);
    expect(safeGetElementById<HTMLInputElement>('missing')).toBeNull();
  });

  it('throws when required elements are missing', () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    expect(requireElementById<HTMLDivElement>('root')).toBe(div);
    expect(() => requireElementById('missing', 'test')).toThrow(
      "Required element with ID 'missing' not found in test",
    );
  });

  it('supports safe query selectors', () => {
    const container = document.createElement('div');
    container.innerHTML = '<span class="label">Hello</span>';
    document.body.appendChild(container);

    expect(
      safeQuerySelector<HTMLSpanElement>(container, '.label')?.textContent,
    ).toBe('Hello');
    expect(
      safeQuerySelector<HTMLSpanElement>(container, '.missing'),
    ).toBeNull();
  });

  it('throws when query selector is required but missing', () => {
    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
    expect(() => requireQuerySelector(wrapper, '.missing', 'context')).toThrow(
      "Required element with selector '.missing' not found in context",
    );
  });

  it('conditionally executes callbacks when elements exist', () => {
    const btn = document.createElement('button');
    btn.id = 'submit';
    document.body.appendChild(btn);

    const callback = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    ifElementExists('submit', callback);
    ifElementExists('missing', callback, 'form');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "Element with ID 'missing' not found in form",
    );
  });

  it('handles multi-element callbacks and warns for missing ones', () => {
    const one = document.createElement('div');
    one.id = 'first';
    const two = document.createElement('div');
    two.id = 'second';
    document.body.appendChild(one);
    document.body.appendChild(two);

    const callback = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    ifElementsExist(['first', 'second'], callback);
    expect(callback).toHaveBeenCalledWith([one, two]);

    ifElementsExist(['first', 'third'], callback, 'test');
    expect(warn).toHaveBeenCalledWith('Missing elements: third in test');
  });
});
