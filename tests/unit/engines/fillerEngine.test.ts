import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FillerEngine } from '@docFillerCore/engines/fillerEngine';
import { QType } from '@utils/questionTypes';

// Mock Settings to avoid sleep delays in tests
vi.mock('@utils/settings', () => ({
  Settings: {
    getInstance: vi.fn(() => ({
      getSleepDuration: vi.fn(async () => 0), // No delay in tests
    })),
  },
}));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FillerEngine', () => {
  let fillerEngine: FillerEngine;

  beforeEach(() => {
    fillerEngine = new FillerEngine();
  });

  describe('fill() - Main routing method', () => {
    it('should return false for null fieldType', async () => {
      const result = await fillerEngine.fill(null as any, {} as any, {} as any);
      expect(result).toBe(false);
    });

    it('should route TEXT type to fillText', async () => {
      const dom = document.createElement('input');
      const fieldValue = { dom };
      const value = { text: 'Test' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);
      expect(result).toBe(true);
      expect((dom as HTMLInputElement).value).toBe('Test');
    });

    it('should route PARAGRAPH type to fillParagraph', async () => {
      const dom = document.createElement('input');
      const fieldValue = { dom };
      const value = { text: 'Long paragraph text' };

      const result = await fillerEngine.fill(
        QType.PARAGRAPH,
        fieldValue,
        value,
      );
      expect(result).toBe(true);
      expect((dom as HTMLInputElement).value).toBe('Long paragraph text');
    });
  });

  describe('TEXT field filling', () => {
    it('should fill text input successfully', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: 'John Doe' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(true);
      expect(inputElement.value).toBe('John Doe');
    });

    it('should dispatch input event on text fill', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: 'Test' };

      let eventFired = false;
      inputElement.addEventListener('input', () => {
        eventFired = true;
      });

      await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(eventFired).toBe(true);
    });

    it('should return false if text value is missing', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: null } as any;

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(false);
      expect(inputElement.value).toBe('');
    });

    it('should return false if dom element is missing', async () => {
      const fieldValue = { dom: null } as any;
      const value = { text: 'Test' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should handle special characters in text', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: 'Special chars: @#$%^&*()_+{}|:"<>?' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(true);
      expect(inputElement.value).toBe('Special chars: @#$%^&*()_+{}|:"<>?');
    });

    it('should handle unicode characters', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: '日本語 한국어 中文' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(true);
      expect(inputElement.value).toBe('日本語 한국어 中文');
    });

    it('should handle empty string as falsy (returns false)', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: '' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      // Implementation treats empty string as falsy, so it returns false
      expect(result).toBe(false);
      expect(inputElement.value).toBe('');
    });
  });

  describe('TEXT_EMAIL field filling', () => {
    it('should fill email with genericResponse', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { genericResponse: { answer: 'test@example.com' } };

      const result = await fillerEngine.fill(
        QType.TEXT_EMAIL,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(inputElement.value).toBe('test@example.com');
    });

    it('should return false if genericResponse is missing', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { genericResponse: null } as any;

      const result = await fillerEngine.fill(
        QType.TEXT_EMAIL,
        fieldValue,
        value,
      );

      expect(result).toBe(false);
    });
  });

  describe('TEXT_URL field filling', () => {
    it('should fill URL with genericResponse', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { genericResponse: { answer: 'https://example.com' } };

      const result = await fillerEngine.fill(QType.TEXT_URL, fieldValue, value);

      expect(result).toBe(true);
      expect(inputElement.value).toBe('https://example.com');
    });

    it('should handle complex URLs', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = {
        genericResponse: {
          answer: 'https://example.com/path?query=value&param=123#fragment',
        },
      };

      const result = await fillerEngine.fill(QType.TEXT_URL, fieldValue, value);

      expect(result).toBe(true);
      expect(inputElement.value).toContain('example.com/path');
    });
  });

  describe('PARAGRAPH field filling', () => {
    it('should fill paragraph text', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = {
        text: 'This is a long paragraph with multiple sentences. It contains detailed information.',
      };

      const result = await fillerEngine.fill(
        QType.PARAGRAPH,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(inputElement.value).toContain('multiple sentences');
    });

    it('should handle very long paragraphs', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const longText = 'A'.repeat(5000);
      const value = { text: longText };

      const result = await fillerEngine.fill(
        QType.PARAGRAPH,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(inputElement.value.length).toBe(5000);
    });
  });

  describe('DATE field filling', () => {
    it('should fill date fields correctly', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
      };

      const date = new Date('2024-03-15T00:00:00Z');
      const value = { date };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true);
      expect(dateInput.value).toBe('15');
      expect(monthInput.value).toBe('03');
      expect(yearInput.value).toBe('2024');
    });

    it('should fill Chrome date field when present', async () => {
      const chromeDateInput = document.createElement('input');
      chromeDateInput.type = 'date';

      const fieldValue = {
        chromeDateField: chromeDateInput,
      };

      const date = new Date('2024-12-25T00:00:00Z');
      const value = { date };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true);
      expect(chromeDateInput.value).toBe('2024-12-25');
    });

    it('should handle January (month edge case)', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
      };

      const date = new Date('2024-01-01T00:00:00Z');
      const value = { date };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true);
      expect(monthInput.value).toBe('01');
    });

    it('should handle December (month edge case)', async () => {
      const monthInput = document.createElement('input');
      const fieldValue = { month: monthInput };
      const date = new Date('2024-12-31T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(monthInput.value).toBe('12');
    });

    it('should pad single digit days and months', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
      };

      const date = new Date('2024-05-07T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(dateInput.value).toBe('07');
      expect(monthInput.value).toBe('05');
    });

    it('should return false for invalid date', async () => {
      const dateInput = document.createElement('input');
      const fieldValue = { date: dateInput };
      const value = { date: new Date('invalid') };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should return false if date is not Date instance', async () => {
      const dateInput = document.createElement('input');
      const fieldValue = { date: dateInput };
      const value = { date: '2024-01-01' as any };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should return false if date value is missing', async () => {
      const dateInput = document.createElement('input');
      const fieldValue = { date: dateInput };
      const value = { date: null } as any;

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(false);
    });
  });

  describe('TIME field filling', () => {
    it('should fill time fields correctly', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('1970-01-01T14:30:00Z');
      const value = { date };

      const result = await fillerEngine.fill(QType.TIME, fieldValue, value);

      expect(result).toBe(true);
      expect(hourInput.value).toBe('14');
      expect(minuteInput.value).toBe('30');
    });

    it('should pad single digit hours and minutes', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('1970-01-01T09:05:00Z');
      const value = { date };

      await fillerEngine.fill(QType.TIME, fieldValue, value);

      expect(hourInput.value).toBe('09');
      expect(minuteInput.value).toBe('05');
    });

    it('should handle midnight (00:00)', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('1970-01-01T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.TIME, fieldValue, value);

      expect(hourInput.value).toBe('00');
      expect(minuteInput.value).toBe('00');
    });

    it('should handle 23:59', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('1970-01-01T23:59:00Z');
      const value = { date };

      await fillerEngine.fill(QType.TIME, fieldValue, value);

      expect(hourInput.value).toBe('23');
      expect(minuteInput.value).toBe('59');
    });
  });

  describe('DURATION field filling', () => {
    it('should fill duration fields', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');
      const secondInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
        second: secondInput,
      };

      // 2 hours, 15 minutes, 30 seconds
      const date = new Date('1970-01-01T02:15:30Z');
      const value = { date };

      const result = await fillerEngine.fill(QType.DURATION, fieldValue, value);

      expect(result).toBe(true);
      // Note: Duration does NOT zero-pad values in the implementation
      expect(hourInput.value).toBe('2');
      expect(minuteInput.value).toBe('15');
      expect(secondInput.value).toBe('30');
    });

    it('should handle short duration (only seconds)', async () => {
      const secondInput = document.createElement('input');
      const fieldValue = { second: secondInput };
      const date = new Date('1970-01-01T00:00:45Z');
      const value = { date };

      await fillerEngine.fill(QType.DURATION, fieldValue, value);

      expect(secondInput.value).toBe('45');
    });
  });

  describe('DATE_AND_TIME field filling', () => {
    it('should fill date and time fields', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('2024-06-15T14:30:00Z');
      const value = { date };

      const result = await fillerEngine.fill(
        QType.DATE_AND_TIME,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(dateInput.value).toBe('15');
      expect(monthInput.value).toBe('06');
      expect(yearInput.value).toBe('2024');
      expect(hourInput.value).toBe('14');
      expect(minuteInput.value).toBe('30');
    });
  });

  describe('DATE_WITHOUT_YEAR field filling', () => {
    it('should fill date without year', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
      };

      const date = new Date('2000-08-25T00:00:00Z');
      const value = { date };

      const result = await fillerEngine.fill(
        QType.DATE_WITHOUT_YEAR,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(dateInput.value).toBe('25');
      expect(monthInput.value).toBe('08');
    });
  });

  describe('DATE_TIME_WITHOUT_YEAR field filling', () => {
    it('should fill date and time without year', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('2000-03-20T11:45:00Z');
      const value = { date };

      const result = await fillerEngine.fill(
        QType.DATE_TIME_WITHOUT_YEAR,
        fieldValue,
        value,
      );

      expect(result).toBe(true);
      expect(dateInput.value).toBe('20');
      expect(monthInput.value).toBe('03');
      expect(hourInput.value).toBe('11');
      expect(minuteInput.value).toBe('45');
    });
  });

  describe('Event dispatching', () => {
    it('should dispatch bubbling input events', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: 'Test' };

      let eventBubbled = false;
      inputElement.addEventListener('input', (e) => {
        eventBubbled = (e as Event).bubbles;
      });

      await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(eventBubbled).toBe(true);
    });

    it('should allow event listeners to access new value', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = { text: 'New Value' };

      let capturedValue = '';
      inputElement.addEventListener('input', () => {
        capturedValue = inputElement.value;
      });

      await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(capturedValue).toBe('New Value');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined fieldValue properties gracefully', async () => {
      const fieldValue = {
        date: undefined,
        month: undefined,
        year: undefined,
      } as any;
      const value = { date: new Date('2024-01-01') };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true); // Should not throw error
    });

    it('should handle null DOM elements', async () => {
      const fieldValue = { dom: null } as any;
      const value = { text: 'Test' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should handle empty fieldValue object', async () => {
      const fieldValue = {};
      const value = { text: 'Test' };

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should handle empty LLM response', async () => {
      const inputElement = document.createElement('input');
      const fieldValue = { dom: inputElement };
      const value = {};

      const result = await fillerEngine.fill(QType.TEXT, fieldValue, value);

      expect(result).toBe(false);
    });

    it('should not throw on date fields with only partial inputs', async () => {
      const dateInput = document.createElement('input');
      const fieldValue = { date: dateInput }; // Missing month and year
      const value = { date: new Date('2024-01-15') };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true);
      expect(dateInput.value).toBe('15');
    });
  });

  describe('Chrome-specific field handling', () => {
    it('should prefer chromeDateField over individual date fields', async () => {
      const chromeDateInput = document.createElement('input');
      chromeDateInput.type = 'date';
      const dateInput = document.createElement('input');

      const fieldValue = {
        chromeDateField: chromeDateInput,
        date: dateInput, // Should be ignored
      };

      const date = new Date('2024-07-04T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(chromeDateInput.value).toBe('2024-07-04');
      expect(dateInput.value).toBe(''); // Should not be filled
    });

    it('should use chromeDateField for DATE_AND_TIME', async () => {
      const chromeDateInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        chromeDateField: chromeDateInput,
        hour: hourInput,
        minute: minuteInput,
      };

      const date = new Date('2024-11-11T10:30:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE_AND_TIME, fieldValue, value);

      expect(chromeDateInput.value).toBe('2024-11-11');
      expect(hourInput.value).toBe('10');
      expect(minuteInput.value).toBe('30');
    });
  });

  describe('Zero-padding', () => {
    it('should zero-pad all date components', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const fieldValue = { date: dateInput, month: monthInput };
      const date = new Date('2024-01-01T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(dateInput.value).toBe('01');
      expect(monthInput.value).toBe('01');
    });

    it('should zero-pad time components', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');
      const fieldValue = { hour: hourInput, minute: minuteInput };
      const date = new Date('1970-01-01T01:05:00Z');
      const value = { date };

      await fillerEngine.fill(QType.TIME, fieldValue, value);

      expect(hourInput.value).toBe('01');
      expect(minuteInput.value).toBe('05');
    });

    it('should NOT zero-pad duration components (implementation behavior)', async () => {
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');
      const secondInput = document.createElement('input');
      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
        second: secondInput,
      };
      const date = new Date('1970-01-01T00:05:09Z');
      const value = { date };

      await fillerEngine.fill(QType.DURATION, fieldValue, value);

      // Duration implementation does NOT zero-pad
      expect(hourInput.value).toBe('0');
      expect(minuteInput.value).toBe('5');
      expect(secondInput.value).toBe('9');
    });
  });

  describe('Complex date scenarios', () => {
    it('should handle leap year dates', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
      };
      const date = new Date('2024-02-29T00:00:00Z'); // Leap year
      const value = { date };

      const result = await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(result).toBe(true);
      expect(dateInput.value).toBe('29');
      expect(monthInput.value).toBe('02');
      expect(yearInput.value).toBe('2024');
    });

    it('should handle end-of-year dates', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
      };
      const date = new Date('2023-12-31T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(dateInput.value).toBe('31');
      expect(monthInput.value).toBe('12');
      expect(yearInput.value).toBe('2023');
    });

    it('should handle start-of-year dates', async () => {
      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
      };
      const date = new Date('2024-01-01T00:00:00Z');
      const value = { date };

      await fillerEngine.fill(QType.DATE, fieldValue, value);

      expect(dateInput.value).toBe('01');
      expect(monthInput.value).toBe('01');
      expect(yearInput.value).toBe('2024');
    });
  });

  describe('Meridiem-based time handling', () => {
    const setupMeridiemField = (labels: string[] = ['AM', 'PM']) => {
      const wrapper = document.createElement('div');

      const meridiemButton = document.createElement('div');
      meridiemButton.setAttribute('aria-expanded', 'false');
      const presentation = document.createElement('div');
      presentation.setAttribute('role', 'presentation');
      meridiemButton.appendChild(presentation);
      wrapper.appendChild(meridiemButton);

      const dummyContainer = document.createElement('div');
      const dummyInner = document.createElement('div');
      dummyInner.setAttribute('role', 'presentation');
      dummyContainer.appendChild(dummyInner);
      wrapper.appendChild(dummyContainer);

      const optionsContainer = document.createElement('div');
      wrapper.appendChild(optionsContainer);

      const spans: Record<string, HTMLSpanElement> = {};
      labels.forEach((label) => {
        const option = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = label;
        span.addEventListener('click', () => {
          span.setAttribute('data-selected', 'true');
        });
        option.appendChild(span);
        optionsContainer.appendChild(option);
        spans[label] = span;
      });

      meridiemButton.addEventListener('click', () => {
        meridiemButton.setAttribute('aria-expanded', 'true');
      });

      document.body.appendChild(wrapper);

      return { meridiemButton, spans };
    };

    it('should fill date/time with meridiem correctly', async () => {
      const { meridiemButton, spans } = setupMeridiemField();

      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        year: yearInput,
        hour: hourInput,
        minute: minuteInput,
        meridiem: meridiemButton,
      };

      const date = new Date('2024-06-10T18:45:00Z'); // 6:45 PM UTC
      const result = await fillerEngine.fill(
        QType.DATE_TIME_WITH_MERIDIEM,
        fieldValue,
        { date },
      );

      expect(result).toBe(true);
      expect(dateInput.value).toBe('10');
      expect(monthInput.value).toBe('06');
      expect(yearInput.value).toBe('2024');
      expect(hourInput.value).toBe('06');
      expect(minuteInput.value).toBe('45');
      expect(spans['PM']?.getAttribute('data-selected')).toBe('true');
    });

    it('should fill time with meridiem in 12-hour format', async () => {
      const { meridiemButton, spans } = setupMeridiemField();
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
        meridiem: meridiemButton,
      };

      const date = new Date('1970-01-01T04:05:00Z'); // 4:05 AM
      const result = await fillerEngine.fill(
        QType.TIME_WITH_MERIDIEM,
        fieldValue,
        { date },
      );

      expect(result).toBe(true);
      expect(hourInput.value).toBe('04');
      expect(minuteInput.value).toBe('05');
      expect(spans['AM']?.getAttribute('data-selected')).toBe('true');
    });

    it('should return false when meridiem option is not available', async () => {
      const { meridiemButton } = setupMeridiemField(['AM']); // Only AM option
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        hour: hourInput,
        minute: minuteInput,
        meridiem: meridiemButton,
      };

      const date = new Date('1970-01-01T17:15:00Z'); // 5:15 PM -> expects PM
      const result = await fillerEngine.fill(
        QType.TIME_WITH_MERIDIEM,
        fieldValue,
        { date },
      );

      expect(result).toBe(false);
      expect(hourInput.value).toBe('05');
      expect(minuteInput.value).toBe('15');
    });

    it('should fill date/time without year but with meridiem', async () => {
      const { meridiemButton, spans } = setupMeridiemField();

      const dateInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const fieldValue = {
        date: dateInput,
        month: monthInput,
        hour: hourInput,
        minute: minuteInput,
        meridiem: meridiemButton,
      };

      const date = new Date('2000-03-20T11:30:00Z'); // 11:30 AM
      const result = await fillerEngine.fill(
        QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR,
        fieldValue,
        { date },
      );

      expect(result).toBe(true);
      expect(dateInput.value).toBe('20');
      expect(monthInput.value).toBe('03');
      expect(hourInput.value).toBe('11');
      expect(minuteInput.value).toBe('30');
      expect(spans['AM']?.getAttribute('data-selected')).toBe('true');
    });
  });

  describe('Multiple choice and checkbox selections', () => {
    const createOption = (label: string) => {
      const element = document.createElement('div');
      element.setAttribute('aria-checked', 'false');
      element.addEventListener('click', () => {
        element.setAttribute('aria-checked', 'true');
      });
      return { data: label, dom: element };
    };

    it('should select a standard multiple choice option', async () => {
      const optionA = createOption('Option A');
      const optionB = createOption('Option B');
      const fieldValue = {
        options: [optionA, optionB],
        other: {
          dom: document.createElement('div'),
          inputBoxDom: document.createElement('input'),
        },
      };

      const result = await fillerEngine.fill(
        QType.MULTIPLE_CHOICE,
        fieldValue as any,
        { multipleChoice: { optionText: 'Option B' } },
      );

      expect(result).toBe(true);
      expect(optionB.dom.getAttribute('aria-checked')).toBe('true');
      expect(optionA.dom.getAttribute('aria-checked')).toBe('false');
    });

    it('should fill "Other" option for multiple choice', async () => {
      const optionA = createOption('Option A');
      const otherDom = document.createElement('div');
      otherDom.setAttribute('aria-checked', 'false');
      otherDom.addEventListener('click', () => {
        otherDom.setAttribute('aria-checked', 'true');
      });
      const otherInput = document.createElement('input');

      const fieldValue = {
        options: [optionA],
        other: {
          dom: otherDom,
          inputBoxDom: otherInput,
        },
      };

      const result = await fillerEngine.fill(
        QType.MULTIPLE_CHOICE_WITH_OTHER,
        fieldValue as any,
        {
          multipleChoice: {
            optionText: 'Other',
            isOther: true,
            otherOptionValue: 'Custom answer',
          },
        },
      );

      expect(result).toBe(true);
      expect(otherDom.getAttribute('aria-checked')).toBe('true');
      expect(otherInput.getAttribute('value')).toBe('Custom answer');
    });

    it('should fill multi-correct options including "Other"', async () => {
      const optionA = createOption('Option A');
      const optionB = createOption('Option B');
      const otherDom = document.createElement('div');
      otherDom.setAttribute('aria-checked', 'false');
      otherDom.addEventListener('click', () => {
        otherDom.setAttribute('aria-checked', 'true');
      });
      const otherInput = document.createElement('input');

      const fieldValue = {
        options: [optionA, optionB],
        other: {
          dom: otherDom,
          inputBoxDom: otherInput,
        },
      };

      const result = await fillerEngine.fill(
        QType.MULTI_CORRECT_WITH_OTHER,
        fieldValue as any,
        {
          multiCorrect: [
            { optionText: 'Option A' },
            {
              optionText: 'Other',
              isOther: true,
              otherOptionValue: 'Another choice',
            },
          ],
        },
      );

      expect(result).toBe(true);
      expect(optionA.dom.getAttribute('aria-checked')).toBe('true');
      expect(optionB.dom.getAttribute('aria-checked')).toBe('false');
      expect(otherDom.getAttribute('aria-checked')).toBe('true');
      expect(otherInput.getAttribute('value')).toBe('Another choice');
    });

    it('should return false when multi-correct data is missing', async () => {
      const optionA = createOption('Option A');
      const fieldValue = {
        options: [optionA],
      };

      const result = await fillerEngine.fill(
        QType.MULTI_CORRECT,
        fieldValue as any,
        {},
      );

      expect(result).toBe(false);
    });
  });

  describe('Scale and grid handling', () => {
    it('should select the matching linear scale option', async () => {
      const scale1 = document.createElement('div');
      scale1.setAttribute('aria-checked', 'false');
      scale1.addEventListener('click', () => {
        scale1.setAttribute('aria-checked', 'true');
      });

      const scale2 = document.createElement('div');
      scale2.setAttribute('aria-checked', 'false');
      scale2.addEventListener('click', () => {
        scale2.setAttribute('aria-checked', 'true');
      });

      const fieldValue = {
        options: [
          { data: 1, dom: scale1 },
          { data: 5, dom: scale2 },
        ],
      };

      const result = await fillerEngine.fill(
        QType.LINEAR_SCALE_OR_STAR,
        fieldValue as any,
        { linearScale: { answer: 5 } },
      );

      expect(result).toBe(true);
      expect(scale2.getAttribute('aria-checked')).toBe('true');
      expect(scale1.getAttribute('aria-checked')).toBe('false');
    });

    it('should fill checkbox grid selections', async () => {
      const row1col1 = document.createElement('div');
      const row1col1Checkbox = document.createElement('div');
      row1col1Checkbox.setAttribute('role', 'checkbox');
      row1col1Checkbox.setAttribute('aria-checked', 'false');
      row1col1.appendChild(row1col1Checkbox);
      row1col1.addEventListener('click', () => {
        row1col1Checkbox.setAttribute('aria-checked', 'true');
      });

      const row1col2 = document.createElement('div');
      const row1col2Checkbox = document.createElement('div');
      row1col2Checkbox.setAttribute('role', 'checkbox');
      row1col2Checkbox.setAttribute('aria-checked', 'false');
      row1col2.appendChild(row1col2Checkbox);
      row1col2.addEventListener('click', () => {
        row1col2Checkbox.setAttribute('aria-checked', 'true');
      });

      const fieldValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [
              { data: 'Column 1', dom: row1col1 },
              { data: 'Column 2', dom: row1col2 },
            ],
          },
        ],
      };

      const result = await fillerEngine.fill(
        QType.CHECKBOX_GRID,
        fieldValue as any,
        {
          checkboxGrid: [
            {
              row: 'Row 1',
              cols: [{ data: 'Column 2' }],
            },
          ],
        },
      );

      expect(result).toBe(true);
      expect(
        row1col2
          .querySelector('div[role="checkbox"]')
          ?.getAttribute('aria-checked'),
      ).toBe('true');
      expect(
        row1col1
          .querySelector('div[role="checkbox"]')
          ?.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('should fill multiple choice grid selections', async () => {
      const row1col1 = document.createElement('div');
      row1col1.setAttribute('aria-checked', 'false');
      row1col1.addEventListener('click', () => {
        row1col1.setAttribute('aria-checked', 'true');
      });

      const row1col2 = document.createElement('div');
      row1col2.setAttribute('aria-checked', 'false');
      row1col2.addEventListener('click', () => {
        row1col2.setAttribute('aria-checked', 'true');
      });

      const fieldValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [
              { data: 'Column 1', dom: row1col1 },
              { data: 'Column 2', dom: row1col2 },
            ],
          },
        ],
      };

      const result = await fillerEngine.fill(
        QType.MULTIPLE_CHOICE_GRID,
        fieldValue as any,
        {
          multipleChoiceGrid: [
            {
              row: 'Row 1',
              selectedColumn: 'Column 1',
            },
          ],
        },
      );

      expect(result).toBe(true);
      expect(row1col1.getAttribute('aria-checked')).toBe('true');
      expect(row1col2.getAttribute('aria-checked')).toBe('false');
    });
  });

  describe('Dropdown handling', () => {
    const setupDropdown = () => {
      const dropdown = document.createElement('div');
      dropdown.setAttribute('aria-expanded', 'false');

      const trigger = document.createElement('div');
      trigger.setAttribute('role', 'presentation');
      trigger.addEventListener('click', () => {
        dropdown.setAttribute('aria-expanded', 'true');
      });
      dropdown.appendChild(trigger);

      const optionsContainer = document.createElement('div');

      const optionOne = document.createElement('div');
      optionOne.setAttribute('role', 'option');
      optionOne.addEventListener('click', () => {
        optionOne.setAttribute('data-selected', 'true');
      });
      const optionOneSpan = document.createElement('span');
      optionOneSpan.textContent = 'Choice 1';
      optionOne.appendChild(optionOneSpan);
      optionsContainer.appendChild(optionOne);

      const optionTwo = document.createElement('div');
      optionTwo.setAttribute('role', 'option');
      optionTwo.addEventListener('click', () => {
        optionTwo.setAttribute('data-selected', 'true');
      });
      const optionTwoSpan = document.createElement('span');
      optionTwoSpan.textContent = 'Choice 2';
      optionTwo.appendChild(optionTwoSpan);
      optionsContainer.appendChild(optionTwo);

      dropdown.appendChild(optionsContainer);
      document.body.appendChild(dropdown);

      return { dropdown, optionOne, optionTwo };
    };

    it('should select the matching dropdown option', async () => {
      const { dropdown, optionTwo } = setupDropdown();
      const fieldValue = {
        dom: dropdown,
        options: [{ data: 'Choice 1' }, { data: 'Choice 2' }],
      };

      const result = await fillerEngine.fill(
        QType.DROPDOWN,
        fieldValue as any,
        { genericResponse: { answer: 'Choice 2' } },
      );

      expect(result).toBe(true);
      expect(optionTwo.getAttribute('data-selected')).toBe('true');
      expect(dropdown.getAttribute('aria-expanded')).toBe('true');
    });

    it('should return false when dropdown option is not found', async () => {
      const { dropdown } = setupDropdown();
      const fieldValue = {
        dom: dropdown,
        options: [{ data: 'Choice 1' }],
      };

      const result = await fillerEngine.fill(
        QType.DROPDOWN,
        fieldValue as any,
        { genericResponse: { answer: 'Missing option' } },
      );

      expect(result).toBe(false);
      expect(
        Array.from(document.body.children).some(
          (child) =>
            child instanceof HTMLDivElement &&
            child.style.cursor === 'not-allowed',
        ),
      ).toBe(false);
    });
  });
});
