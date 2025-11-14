import { describe, it, expect, beforeEach } from 'vitest';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { QType } from '@utils/questionTypes';

describe('ValidatorEngine', () => {
  let validator: ValidatorEngine;

  beforeEach(() => {
    validator = new ValidatorEngine();
  });

  describe('validate', () => {
    it('should return false for null response', () => {
      const result = validator.validate(QType.TEXT, {}, null);
      expect(result).toBe(false);
    });

    it('should return false for null fieldType', () => {
      const result = validator.validate(null as any, {}, { text: 'test' });
      expect(result).toBe(false);
    });

    it('should return false for null extractedValue', () => {
      const result = validator.validate(QType.TEXT, null as any, { text: 'test' });
      expect(result).toBe(false);
    });

    it('should handle Date string conversion in response', () => {
      const dateString = '2024-01-15T10:30:00.000Z';
      const response: any = { date: dateString };
      
      const result = validator.validate(QType.DATE, {}, response);
      
      expect(result).toBe(true);
      expect(response.date).toBeInstanceOf(Date);
    });

    it('should return false for invalid date string', () => {
      const response: any = { date: 'invalid-date' };
      
      const result = validator.validate(QType.DATE, {}, response);
      
      expect(result).toBe(false);
    });
  });

  describe('validateText', () => {
    it('should validate non-empty text', () => {
      const response = { text: 'Hello World' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(true);
    });

    it('should reject empty text', () => {
      const response = { text: '' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(false);
    });

    it('should reject whitespace-only text', () => {
      const response = { text: '   ' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(false);
    });

    it('should reject text with newlines', () => {
      const response = { text: 'Line 1\nLine 2' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(false);
    });

    it('should reject text with carriage returns', () => {
      const response = { text: 'Line 1\rLine 2' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(false);
    });

    it('should accept text with spaces', () => {
      const response = { text: 'Multiple words here' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(true);
    });

    it('should trim text before validation', () => {
      const response = { text: '  trimmed  ' };
      const result = validator.validate(QType.TEXT, {}, response);
      expect(result).toBe(true);
    });
  });

  describe('validateParagraph', () => {
    it('should validate non-empty paragraph', () => {
      const response = { text: 'This is a paragraph with multiple lines.\nLine 2.' };
      const result = validator.validate(QType.PARAGRAPH, {}, response);
      expect(result).toBe(true);
    });

    it('should accept paragraphs with newlines', () => {
      const response = { text: 'Line 1\nLine 2\nLine 3' };
      const result = validator.validate(QType.PARAGRAPH, {}, response);
      expect(result).toBe(true);
    });

    it('should reject empty paragraph', () => {
      const response = { text: '' };
      const result = validator.validate(QType.PARAGRAPH, {}, response);
      expect(result).toBe(false);
    });

    it('should reject whitespace-only paragraph', () => {
      const response = { text: '   \n  ' };
      const result = validator.validate(QType.PARAGRAPH, {}, response);
      expect(result).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const response = { genericResponse: { answer: 'test@example.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(true);
    });

    it('should validate email with subdomain', () => {
      const response = { genericResponse: { answer: 'user@mail.example.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(true);
    });

    it('should validate email with plus sign', () => {
      const response = { genericResponse: { answer: 'user+tag@example.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(true);
    });

    it('should validate email with dots', () => {
      const response = { genericResponse: { answer: 'first.last@example.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(true);
    });

    it('should reject invalid email without @', () => {
      const response = { genericResponse: { answer: 'testexample.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(false);
    });

    it('should reject invalid email without domain', () => {
      const response = { genericResponse: { answer: 'test@' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(false);
    });

    it('should reject email without local part', () => {
      const response = { genericResponse: { answer: '@example.com' } };
      const result = validator.validate(QType.TEXT_EMAIL, {}, response);
      expect(result).toBe(false);
    });
  });

  describe('validateTextUrl', () => {
    it('should validate URL text', () => {
      const response = { genericResponse: { answer: 'https://example.com' } };
      const result = validator.validate(QType.TEXT_URL, {}, response);
      expect(result).toBe(true);
    });

    it('should reject URL with newlines', () => {
      const response = { genericResponse: { answer: 'https://example.com\nnext' } };
      const result = validator.validate(QType.TEXT_URL, {}, response);
      expect(result).toBe(false);
    });
  });

  describe('Date/Time Validation', () => {
    describe('validateDate', () => {
      it('should validate valid Date object', () => {
        const response = { date: new Date('2024-01-15') };
        const result = validator.validate(QType.DATE, {}, response);
        expect(result).toBe(true);
      });

      it('should reject invalid Date object', () => {
        const response = { date: new Date('invalid') };
        const result = validator.validate(QType.DATE, {}, response);
        expect(result).toBe(false);
      });

      it('should reject missing date', () => {
        const response = {};
        const result = validator.validate(QType.DATE, {}, response);
        expect(result).toBe(false);
      });
    });

    describe('validateDateAndTime', () => {
      it('should validate date and time', () => {
        const response = { date: new Date('2024-01-15T14:30:00') };
        const result = validator.validate(QType.DATE_AND_TIME, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateTime', () => {
      it('should validate time', () => {
        const response = { date: new Date('2024-01-01T14:30:00') };
        const result = validator.validate(QType.TIME, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateTimeWithMeridiem', () => {
      it('should validate time with meridiem', () => {
        const response = { date: new Date('2024-01-01T14:30:00') };
        const result = validator.validate(QType.TIME_WITH_MERIDIEM, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateDuration', () => {
      it('should validate duration', () => {
        const response = { date: new Date('2024-01-01T02:30:15') };
        const result = validator.validate(QType.DURATION, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateDateWithoutYear', () => {
      it('should validate date without year', () => {
        const response = { date: new Date('2024-03-15') };
        const result = validator.validate(QType.DATE_WITHOUT_YEAR, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateDateTimeWithoutYear', () => {
      it('should validate date-time without year', () => {
        const response = { date: new Date('2024-03-15T14:30:00') };
        const result = validator.validate(QType.DATE_TIME_WITHOUT_YEAR, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateDateTimeWithMeridiem', () => {
      it('should validate date-time with meridiem', () => {
        const response = { date: new Date('2024-03-15T14:30:00') };
        const result = validator.validate(QType.DATE_TIME_WITH_MERIDIEM, {}, response);
        expect(result).toBe(true);
      });
    });

    describe('validateDateTimeWithMeridiemWithoutYear', () => {
      it('should validate date-time with meridiem without year', () => {
        const response = { date: new Date('2024-03-15T14:30:00') };
        const result = validator.validate(
          QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR,
          {},
          response,
        );
        expect(result).toBe(true);
      });
    });
  });

  describe('validateMultiCorrect', () => {
    it('should validate correct options', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: 'Option 1', dom: null as any },
          { data: 'Option 2', dom: null as any },
          { data: 'Option 3', dom: null as any },
        ],
      };
      const response = {
        multiCorrect: [
          { optionText: 'Option 1' },
          { optionText: 'Option 3' },
        ],
      };
      const result = validator.validate(QType.MULTI_CORRECT, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should be case insensitive', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: 'Option 1', dom: null as any },
          { data: 'Option 2', dom: null as any },
        ],
      };
      const response = {
        multiCorrect: [{ optionText: 'option 1' }],
      };
      const result = validator.validate(QType.MULTI_CORRECT, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject non-existent options', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: 'Option 1', dom: null as any },
          { data: 'Option 2', dom: null as any },
        ],
      };
      const response = {
        multiCorrect: [{ optionText: 'Option 3' }],
      };
      const result = validator.validate(QType.MULTI_CORRECT, extractedValue, response);
      expect(result).toBe(false);
    });

    it('should handle whitespace in options', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: '  Option 1  ', dom: null as any },
        ],
      };
      const response = {
        multiCorrect: [{ optionText: 'Option 1' }],
      };
      const result = validator.validate(QType.MULTI_CORRECT, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject missing multiCorrect', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {};
      const result = validator.validate(QType.MULTI_CORRECT, extractedValue, response);
      expect(result).toBe(false);
    });
  });

  describe('validateMultiCorrectWithOther', () => {
    it('should validate with other option', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multiCorrect: [
          {
            optionText: 'Other',
            isOther: true,
            otherOptionValue: 'Custom answer',
          },
        ],
      };
      const result = validator.validate(
        QType.MULTI_CORRECT_WITH_OTHER,
        extractedValue,
        response,
      );
      expect(result).toBe(true);
    });

    it('should validate with regular options', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multiCorrect: [{ optionText: 'Option 1' }],
      };
      const result = validator.validate(
        QType.MULTI_CORRECT_WITH_OTHER,
        extractedValue,
        response,
      );
      expect(result).toBe(true);
    });

    it('should reject empty other option', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multiCorrect: [
          {
            optionText: 'Other',
            isOther: true,
            otherOptionValue: '',
          },
        ],
      };
      const result = validator.validate(
        QType.MULTI_CORRECT_WITH_OTHER,
        extractedValue,
        response,
      );
      expect(result).toBe(false);
    });
  });

  describe('validateMultipleChoice', () => {
    it('should validate correct choice', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: 'Option 1', dom: null as any },
          { data: 'Option 2', dom: null as any },
        ],
      };
      const response = {
        multipleChoice: { optionText: 'Option 1' },
      };
      const result = validator.validate(QType.MULTIPLE_CHOICE, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should be case insensitive', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multipleChoice: { optionText: 'OPTION 1' },
      };
      const result = validator.validate(QType.MULTIPLE_CHOICE, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject non-existent option', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multipleChoice: { optionText: 'Option 2' },
      };
      const result = validator.validate(QType.MULTIPLE_CHOICE, extractedValue, response);
      expect(result).toBe(false);
    });

    it('should reject non-string optionText', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multipleChoice: { optionText: 123 as any },
      };
      const result = validator.validate(QType.MULTIPLE_CHOICE, extractedValue, response);
      expect(result).toBe(false);
    });
  });

  describe('validateMultipleChoiceWithOther', () => {
    it('should validate regular choice', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multipleChoice: { optionText: 'Option 1' },
      };
      const result = validator.validate(
        QType.MULTIPLE_CHOICE_WITH_OTHER,
        extractedValue,
        response,
      );
      expect(result).toBe(true);
    });

    it('should validate other option', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        multipleChoice: {
          optionText: 'Other',
          isOther: true,
          otherOptionValue: 'Custom answer',
        },
      };
      const result = validator.validate(
        QType.MULTIPLE_CHOICE_WITH_OTHER,
        extractedValue,
        response,
      );
      expect(result).toBe(true);
    });
  });

  describe('validateLinearScale', () => {
    it('should validate correct scale value', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: '1', dom: null as any },
          { data: '2', dom: null as any },
          { data: '3', dom: null as any },
          { data: '4', dom: null as any },
          { data: '5', dom: null as any },
        ],
      };
      const response = {
        linearScale: { answer: 3 },
      };
      const result = validator.validate(QType.LINEAR_SCALE_OR_STAR, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject out-of-range value', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: '1', dom: null as any },
          { data: '2', dom: null as any },
        ],
      };
      const response = {
        linearScale: { answer: 5 },
      };
      const result = validator.validate(QType.LINEAR_SCALE_OR_STAR, extractedValue, response);
      expect(result).toBe(false);
    });
  });

  describe('validateMultipleChoiceGrid', () => {
    it('should validate correct grid selections', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [
              { data: 'Col A', dom: null as any },
              { data: 'Col B', dom: null as any },
            ],
          },
          {
            row: 'Row 2',
            cols: [
              { data: 'Col A', dom: null as any },
              { data: 'Col B', dom: null as any },
            ],
          },
        ],
      };
      const response = {
        multipleChoiceGrid: [
          { selectedColumn: 'Col A' },
          { selectedColumn: 'Col B' },
        ],
      };
      const result = validator.validate(
        QType.MULTIPLE_CHOICE_GRID,
        extractedValue,
        response,
      );
      expect(result).toBe(true);
    });

    it('should reject mismatched row count', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [{ data: 'Col A', dom: null as any }],
          },
        ],
      };
      const response = {
        multipleChoiceGrid: [
          { selectedColumn: 'Col A' },
          { selectedColumn: 'Col A' },
        ],
      };
      const result = validator.validate(
        QType.MULTIPLE_CHOICE_GRID,
        extractedValue,
        response,
      );
      expect(result).toBe(false);
    });

    it('should reject invalid column', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [{ data: 'Col A', dom: null as any }],
          },
        ],
      };
      const response = {
        multipleChoiceGrid: [{ selectedColumn: 'Col B' }],
      };
      const result = validator.validate(
        QType.MULTIPLE_CHOICE_GRID,
        extractedValue,
        response,
      );
      expect(result).toBe(false);
    });
  });

  describe('validateCheckBoxGrid', () => {
    it('should validate correct checkbox grid selections', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [
              { data: 'Col A', dom: null as any },
              { data: 'Col B', dom: null as any },
            ],
          },
        ],
      };
      const response = {
        checkboxGrid: [
          {
            cols: [
              { data: 'Col A' },
              { data: 'Col B' },
            ],
          },
        ],
      };
      const result = validator.validate(QType.CHECKBOX_GRID, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should validate partial checkbox selections', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [
              { data: 'Col A', dom: null as any },
              { data: 'Col B', dom: null as any },
            ],
          },
        ],
      };
      const response = {
        checkboxGrid: [
          {
            cols: [{ data: 'Col A' }],
          },
        ],
      };
      const result = validator.validate(QType.CHECKBOX_GRID, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject invalid checkbox selections', () => {
      const extractedValue: ExtractedValue = {
        rowColumnOption: [
          {
            row: 'Row 1',
            cols: [{ data: 'Col A', dom: null as any }],
          },
        ],
      };
      const response = {
        checkboxGrid: [
          {
            cols: [{ data: 'Col B' }],
          },
        ],
      };
      const result = validator.validate(QType.CHECKBOX_GRID, extractedValue, response);
      expect(result).toBe(false);
    });
  });

  describe('validateDropdown', () => {
    it('should validate correct dropdown selection', () => {
      const extractedValue: ExtractedValue = {
        options: [
          { data: 'Option 1', dom: null as any },
          { data: 'Option 2', dom: null as any },
        ],
      };
      const response = {
        genericResponse: { answer: 'Option 1' },
      };
      const result = validator.validate(QType.DROPDOWN, extractedValue, response);
      expect(result).toBe(true);
    });

    it('should reject non-existent dropdown option', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {
        genericResponse: { answer: 'Option 2' },
      };
      const result = validator.validate(QType.DROPDOWN, extractedValue, response);
      expect(result).toBe(false);
    });

    it('should reject missing genericResponse', () => {
      const extractedValue: ExtractedValue = {
        options: [{ data: 'Option 1', dom: null as any }],
      };
      const response = {};
      const result = validator.validate(QType.DROPDOWN, extractedValue, response);
      expect(result).toBe(false);
    });
  });
});



