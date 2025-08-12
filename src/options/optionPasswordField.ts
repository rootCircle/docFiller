import { safeGetElementById } from '@utils/domUtils';
import { EMPTY_STRING } from '@utils/settings';

export const initializeOptionPasswordField = () => {
  const passwordToggles = document.querySelectorAll('.password-toggle');

  passwordToggles.forEach((toggle) => {
    const button = toggle as HTMLButtonElement;
    const inputId = button.getAttribute('data-for') || EMPTY_STRING;
    const input = safeGetElementById<HTMLInputElement>(inputId);

    if (input) {
      input.type = 'password';
      button.setAttribute('data-visible', 'false');
      button.addEventListener('click', () => {
        const isVisible = button.getAttribute('data-visible') === 'true';
        input.type = isVisible ? 'password' : 'text';
        button.setAttribute('data-visible', (!isVisible).toString());
      });
    }
  });
};
