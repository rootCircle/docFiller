import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectBoxType } from '@docFillerCore/detectors/detectBoxType';
import { QType } from '@utils/questionTypes';

describe('DetectBoxType', () => {
  let detector: DetectBoxType;

  beforeEach(() => {
    detector = new DetectBoxType();
    document.body.innerHTML = '';
  });

  describe('detectType', () => {
    it('should return null for empty element', () => {
      const element = document.createElement('div');
      const result = detector.detectType(element);
      expect(result).toBeNull();
    });

    it('should detect dropdown before text', () => {
      document.body.innerHTML = `
        <div>
          <div role="listbox"></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = detector.detectType(element);
      expect(result).toBe(QType.DROPDOWN);
    });

    it('should return first matching type in priority order', () => {
      // TEXT_EMAIL should be detected before TEXT
      document.body.innerHTML = `
        <div>
          <input type="email" />
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = detector.detectType(element);
      expect(result).toBe(QType.TEXT_EMAIL);
    });
  });

  describe('isDropdown', () => {
    it('should detect dropdown with listbox role', () => {
      document.body.innerHTML = `
        <div>
          <div role="listbox"></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector.isDropdown(element)).toBe(true);
    });

    it('should not detect dropdown if input present', () => {
      document.body.innerHTML = `
        <div>
          <div role="listbox"></div>
          <input type="text" />
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector.isDropdown(element)).toBe(false);
    });

    it('should return false for element without listbox', () => {
      document.body.innerHTML = `<div></div>`;
      const element = document.querySelector('div')!;
      expect(detector.isDropdown(element)).toBe(false);
    });
  });

  describe('isParagraph', () => {
    it('should detect paragraph with textarea', () => {
      document.body.innerHTML = `
        <div>
          <textarea></textarea>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isParagraph'](element)).toBe(true);
    });

    it('should return false without textarea', () => {
      document.body.innerHTML = `<div><input type="text" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isParagraph'](element)).toBe(false);
    });
  });

  describe('isTextEmail', () => {
    it('should detect email input', () => {
      document.body.innerHTML = `
        <div>
          <input type="email" />
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isTextEmail'](element)).toBe(true);
    });

    it('should return false for non-email input', () => {
      document.body.innerHTML = `<div><input type="text" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isTextEmail'](element)).toBe(false);
    });
  });

  describe('isTextURL', () => {
    it('should detect URL input', () => {
      document.body.innerHTML = `
        <div>
          <input type="url" />
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isTextURL'](element)).toBe(true);
    });

    it('should return false for non-URL input', () => {
      document.body.innerHTML = `<div><input type="text" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isTextURL'](element)).toBe(false);
    });
  });

  describe('isText', () => {
    it('should detect text input', () => {
      document.body.innerHTML = `
        <div>
          <input type="text" />
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(true);
    });

    it('should accept input without explicit type', () => {
      document.body.innerHTML = `<div><input /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(true);
    });

    it('should reject email input', () => {
      document.body.innerHTML = `<div><input type="email" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should reject URL input', () => {
      document.body.innerHTML = `<div><input type="url" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should reject tel input', () => {
      document.body.innerHTML = `<div><input type="tel" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should reject number input', () => {
      document.body.innerHTML = `<div><input type="number" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should reject date input', () => {
      document.body.innerHTML = `<div><input type="date" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should reject hidden input', () => {
      document.body.innerHTML = `<div><input type="hidden" /></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should return false with multiple inputs', () => {
      document.body.innerHTML = `
        <div>
          <input type="text" />
          <input type="text" />
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });

    it('should return false with no inputs', () => {
      document.body.innerHTML = `<div></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isText'](element)).toBe(false);
    });
  });

  describe('isMultiCorrect', () => {
    it('should detect checkbox list without other option', () => {
      document.body.innerHTML = `
        <div>
          <div role="list">
            <label></label>
            <label></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultiCorrect'](element)).toBe(true);
    });

    it('should return false if "Other" option exists', () => {
      document.body.innerHTML = `
        <div>
          <div role="list">
            <label></label>
            <label></label>
          </div>
          <div><input type="text" /></div>
        </div>
      `;
      const labels = document.querySelectorAll('label');
      const lastLabel = labels[labels.length - 1];
      const otherInput = document.createElement('div');
      otherInput.innerHTML = '<input type="text" />';
      lastLabel?.parentElement?.insertBefore(
        otherInput,
        lastLabel.nextSibling,
      );

      const element = document.querySelector('div')!;
      expect(detector['isMultiCorrect'](element)).toBe(false);
    });

    it('should return false without list role', () => {
      document.body.innerHTML = `<div><label></label></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isMultiCorrect'](element)).toBe(false);
    });
  });

  describe('isMultiCorrectWithOther', () => {
    it('should detect checkbox list with other option', () => {
      document.body.innerHTML = `
        <div>
          <div role="list">
            <label></label>
            <label></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const labels = element.querySelectorAll('label');
      const lastLabel = labels[labels.length - 1];
      
      // Add "Other" input after last label
      const otherDiv = document.createElement('div');
      otherDiv.innerHTML = '<input type="text" />';
      lastLabel?.parentElement?.appendChild(otherDiv);

      expect(detector['isMultiCorrectWithOther'](element)).toBe(true);
    });

    it('should return false without other option', () => {
      document.body.innerHTML = `
        <div>
          <div role="list">
            <label></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultiCorrectWithOther'](element)).toBe(false);
    });
  });

  describe('isLinearScale', () => {
    it('should detect linear scale with radio divs', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label>
              <div></div>
            </label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isLinearScale'](element)).toBe(true);
    });

    it('should return false if span present in label', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label>
              <span>Option</span>
            </label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isLinearScale'](element)).toBe(false);
    });

    it('should return false without radiogroup', () => {
      document.body.innerHTML = `<div><label><div></div></label></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isLinearScale'](element)).toBe(false);
    });
  });

  describe('isMultipleChoice', () => {
    it('should detect multiple choice with spans', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label><span>Option 1</span></label>
            <label><span>Option 2</span></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoice'](element)).toBe(true);
    });

    it('should return false if other option exists', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label><span>Option 1</span></label>
            <label><span>Option 2</span></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const labels = element.querySelectorAll('label');
      const lastLabel = labels[labels.length - 1];
      
      const otherDiv = document.createElement('div');
      otherDiv.innerHTML = '<input type="text" />';
      lastLabel?.parentElement?.appendChild(otherDiv);

      expect(detector['isMultipleChoice'](element)).toBe(false);
    });

    it('should return false without radiogroup', () => {
      document.body.innerHTML = `<div><label><span>Option</span></label></div>`;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoice'](element)).toBe(false);
    });
  });

  describe('isMultipleChoiceWithOther', () => {
    it('should detect multiple choice with other option', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label><span>Option 1</span></label>
            <label><span>Option 2</span></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const labels = element.querySelectorAll('label');
      const lastLabel = labels[labels.length - 1];
      
      const otherDiv = document.createElement('div');
      otherDiv.innerHTML = '<input type="text" />';
      lastLabel?.parentElement?.appendChild(otherDiv);

      expect(detector['isMultipleChoiceWithOther'](element)).toBe(true);
    });

    it('should return false without other option', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <label><span>Option</span></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoiceWithOther'](element)).toBe(false);
    });
  });

  describe('isCheckboxGrid', () => {
    it('should detect checkbox grid', () => {
      document.body.innerHTML = `
        <div>
          <div role="group">
            <label>
              <div role="checkbox"></div>
            </label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isCheckboxGrid'](element)).toBe(true);
    });

    it('should return false without group role', () => {
      document.body.innerHTML = `
        <div>
          <label>
            <div role="checkbox"></div>
          </label>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isCheckboxGrid'](element)).toBe(false);
    });

    it('should return false without checkbox role', () => {
      document.body.innerHTML = `
        <div>
          <div role="group">
            <label><div></div></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isCheckboxGrid'](element)).toBe(false);
    });
  });

  describe('isMultipleChoiceGrid', () => {
    it('should detect multiple choice grid with table-row display', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <span role="presentation" style="display: table-row;">
              <div role="radio"></div>
            </span>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoiceGrid'](element)).toBe(true);
    });

    it('should return false with flex display', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <span role="presentation" style="display: flex;">
              <div role="radio"></div>
            </span>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoiceGrid'](element)).toBe(false);
    });

    it('should return false without radio buttons', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <span role="presentation" style="display: table-row;"></span>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoiceGrid'](element)).toBe(false);
    });

    it('should return false without presentation span', () => {
      document.body.innerHTML = `
        <div>
          <div role="radiogroup">
            <div role="radio"></div>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      expect(detector['isMultipleChoiceGrid'](element)).toBe(false);
    });
  });

  describe('Date/Time Detection', () => {
    describe('isDate', () => {
      it('should detect date with year, month, day inputs (Firefox)', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDate'](element)).toBe(true);
      });

      it('should detect date input (Chrome)', () => {
        document.body.innerHTML = `
          <div>
            <input type="date" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDate'](element)).toBe(true);
      });

      it('should return false with time fields', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDate'](element)).toBe(false);
      });
    });

    describe('isDateWithoutYear', () => {
      it('should detect date without year', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateWithoutYear'](element)).toBe(true);
      });

      it('should return false with year field', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateWithoutYear'](element)).toBe(false);
      });
    });

    describe('isTime', () => {
      it('should detect time with hour and minute', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isTime'](element)).toBe(true);
      });

      it('should return false with meridiem field', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="option" data-value="AM"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isTime'](element)).toBe(false);
      });
    });

    describe('isTimeWithMeridiem', () => {
      it('should detect time with meridiem selector', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="option" data-value="AM"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isTimeWithMeridiem'](element)).toBe(true);
      });
    });

    describe('isDuration', () => {
      it('should detect duration with hours, minutes, seconds', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hours" />
            <input type="text" aria-label="Minutes" />
            <input type="text" aria-label="Seconds" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDuration'](element)).toBe(true);
      });

      it('should return false without seconds', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDuration'](element)).toBe(false);
      });
    });

    describe('isDateAndTime', () => {
      it('should detect date and time (Firefox)', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateAndTime'](element)).toBe(true);
      });

      it('should detect date and time (Chrome)', () => {
        document.body.innerHTML = `
          <div>
            <input type="date" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateAndTime'](element)).toBe(true);
      });
    });

    describe('isDateAndTimeWithMeridiem', () => {
      it('should detect date and time with meridiem (Firefox)', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="option" data-value="AM"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateAndTimeWithMeridiem'](element)).toBe(true);
      });

      it('should detect date and time with meridiem (Chrome)', () => {
        document.body.innerHTML = `
          <div>
            <input type="date" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="option" data-value="AM"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateAndTimeWithMeridiem'](element)).toBe(true);
      });
    });

    describe('isDateWithoutYearWithTime', () => {
      it('should detect date without year with time', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateWithoutYearWithTime'](element)).toBe(true);
      });
    });

    describe('isDateWithoutYearWithTimeAndMeridiem', () => {
      it('should detect date without year with time and meridiem', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="option" data-value="AM"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        expect(detector['isDateWithoutYearWithTimeAndMeridiem'](element)).toBe(
          true,
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null element gracefully', () => {
      const element = document.createElement('div');
      const result = detector.detectType(element);
      expect(result).toBeNull();
    });

    it('should handle malformed HTML', () => {
      document.body.innerHTML = `<div><broken></div>`;
      const element = document.querySelector('div')!;
      const result = detector.detectType(element);
      // Should not throw, should return null or a type
      expect(result).toBeDefined();
    });

    it('should handle nested structures', () => {
      document.body.innerHTML = `
        <div>
          <div>
            <div>
              <input type="email" />
            </div>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = detector.detectType(element);
      expect(result).toBe(QType.TEXT_EMAIL);
    });

    it('should handle empty aria-labels', () => {
      document.body.innerHTML = `
        <div>
          <input type="text" aria-label="" />
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = detector.detectType(element);
      expect(result).toBe(QType.TEXT);
    });
  });
});

