import { describe, expect, it } from 'vitest';

import { initializeOptionPasswordField } from '@options/optionPasswordField';

describe('initializeOptionPasswordField', () => {
  it('attaches toggle handlers to password fields', () => {
    document.body.innerHTML = `
      <div>
        <input id="apiKey" type="text" />
        <button class="password-toggle" data-for="apiKey"></button>
      </div>
    `;

    initializeOptionPasswordField();

    const input = document.getElementById('apiKey') as HTMLInputElement;
    const button = document.querySelector('.password-toggle') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(button.getAttribute('data-visible')).toBe('false');

    button.click();
    expect(input.type).toBe('text');
    expect(button.getAttribute('data-visible')).toBe('true');
  });
});



