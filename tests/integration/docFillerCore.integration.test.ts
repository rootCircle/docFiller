import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QType } from '@utils/questionTypes';

/**
 * Integration tests for docFillerCore engine interactions.
 * These tests verify that engines work together correctly.
 */

import { PromptEngine } from '@docFillerCore/engines/promptEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { FillerEngine } from '@docFillerCore/engines/fillerEngine';

// Mock Settings
vi.mock('@utils/settings', () => ({
  Settings: {
    getInstance: vi.fn(() => ({
      getSleepDuration: vi.fn(async () => 0),
    })),
  },
  EMPTY_STRING: '',
}));

describe('DocFillerCore Engine Integration Tests', () => {
  let promptEngine: PromptEngine;
  let validatorEngine: ValidatorEngine;
  let fillerEngine: FillerEngine;

  beforeEach(() => {
    promptEngine = new PromptEngine();
    validatorEngine = new ValidatorEngine();
    fillerEngine = new FillerEngine();
  });

  describe('Prompt → Validate → Fill Integration', () => {
    it('should handle TEXT field flow', async () => {
      const input = document.createElement('input');
      const field: ExtractedValue = { dom: input, title: 'Name' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('Name');

      const response = { text: 'John' };
      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toBe('John');
    });

    it('should handle DATE field flow', async () => {
      const day = document.createElement('input');
      const month = document.createElement('input');
      const year = document.createElement('input');
      const field: ExtractedValue = {
        title: 'DOB',
        date: day,
        month,
        year,
      };

      const prompt = promptEngine.getPrompt(QType.DATE, field);
      expect(prompt).toContain('DOB');

      const response = { date: new Date('1990-01-15Z') };
      const valid = validatorEngine.validate(QType.DATE, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.DATE, field, response);
      expect(day.value).toBe('15');
      expect(month.value).toBe('01');
      expect(year.value).toBe('1990');
    });

    it('should handle LINEAR_SCALE flow', async () => {
      const opts = [1, 2, 3, 4, 5].map(n => ({
        dom: document.createElement('div'),
        data: String(n),
      }));
      const field: ExtractedValue = {
        title: 'Rate',
        options: opts,
        bounds: { lowerBound: 'Bad', upperBound: 'Good' },
      };

      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, field);
      expect(prompt).toContain('Rate');
      expect(prompt).toContain('Bad');

      const response = { linearScale: { answer: 4 } };
      const valid = validatorEngine.validate(
        QType.LINEAR_SCALE_OR_STAR,
        field,
        response,
      );
      expect(valid).toBe(true);
    });
  });

  describe('Validation Error Handling', () => {
    it('should reject invalid TEXT', () => {
      const field: ExtractedValue = { dom: document.createElement('input'), title: 'Name' };
      const invalid = {};
      const valid = validatorEngine.validate(QType.TEXT, field, invalid);
      expect(valid).toBe(false);
    });

    it('should reject invalid DATE', () => {
      const field: ExtractedValue = {
        date: document.createElement('input'),
        title: 'Date',
      };
      const invalid = { date: new Date('invalid') };
      const valid = validatorEngine.validate(QType.DATE, field, invalid);
      expect(valid).toBe(false);
    });

    it('should reject out-of-range LINEAR_SCALE', () => {
      const opts = [1, 2, 3].map(n => ({
        dom: document.createElement('div'),
        data: String(n),
      }));
      const field: ExtractedValue = { title: 'Rate', options: opts };
      const invalid = { linearScale: { answer: 10 } };
      const valid = validatorEngine.validate(
        QType.LINEAR_SCALE_OR_STAR,
        field,
        invalid,
      );
      expect(valid).toBe(false);
    });
  });

  describe('Prompt Generation Quality', () => {
    it('should include all context in prompts', () => {
      const field: ExtractedValue = {
        title: 'How satisfied?',
        description: 'Rate 1-10',
        options: Array.from({ length: 10 }, (_, i) => ({
          dom: document.createElement('div'),
          data: String(i + 1),
        })),
        bounds: { lowerBound: 'Poor', upperBound: 'Great' },
      };

      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, field);
      expect(prompt).toContain('How satisfied?');
      expect(prompt).toContain('Rate 1-10');
      expect(prompt).toContain('Poor');
      expect(prompt).toContain('Great');
    });
  });
});
