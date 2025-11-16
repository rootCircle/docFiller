import { describe, it, expect } from 'vitest';
import { PromptEngine } from '@docFillerCore/engines/promptEngine';
import { QType } from '@utils/questionTypes';

describe('PromptEngine', () => {
  const promptEngine = new PromptEngine();

  describe('TEXT type prompts', () => {
    it('should generate prompt for TEXT with title and description', () => {
      const value = {
        title: 'What is your name?',
        description: 'Enter your full legal name',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT, value);
      expect(prompt).toContain('What is your name?');
      expect(prompt).toContain('Enter your full legal name');
      expect(prompt).toContain('single-sentence response');
    });

    it('should handle TEXT with only title', () => {
      const value = {
        title: 'What is your name?',
        description: '',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT, value);
      expect(prompt).toContain('What is your name?');
      expect(prompt).toBeTruthy();
    });

    it('should handle TEXT with missing description', () => {
      const value = {
        title: 'Occupation',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT, value);
      expect(prompt).toContain('Occupation');
      expect(prompt).toBeTruthy();
    });
  });

  describe('TEXT_EMAIL type prompts', () => {
    it('should generate email prompt with clear instructions', () => {
      const value = {
        title: 'Email Address',
        description: 'Provide your work email',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT_EMAIL, value);
      expect(prompt).toContain('Email Address');
      expect(prompt).toContain('Provide your work email');
      expect(prompt).toContain('username@domain.com');
      expect(prompt).toContain('dummyemail@gmail.com');
    });

    it('should include fallback email in prompt', () => {
      const value = {
        title: 'Contact Email',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT_EMAIL, value);
      expect(prompt).toContain('dummyemail@gmail.com');
    });
  });

  describe('TEXT_URL type prompts', () => {
    it('should generate URL prompt with plain text instruction', () => {
      const value = {
        title: 'Website URL',
        description: 'Enter your portfolio website',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT_URL, value);
      expect(prompt).toContain('Website URL');
      expect(prompt).toContain('Enter your portfolio website');
      expect(prompt).toContain('plain text URL');
      expect(prompt).toContain('not formatted as a hyperlink');
    });
  });

  describe('PARAGRAPH type prompts', () => {
    it('should generate paragraph prompt requesting detailed response', () => {
      const value = {
        title: 'Tell us about yourself',
        description: 'Describe your background and experience',
      };
      const prompt = promptEngine.getPrompt(QType.PARAGRAPH, value);
      expect(prompt).toContain('Tell us about yourself');
      expect(prompt).toContain('Describe your background and experience');
      expect(prompt).toContain('detailed response');
      expect(prompt).toContain('plain text paragraph');
    });
  });

  describe('LINEAR_SCALE_OR_STAR type prompts', () => {
    it('should generate linear scale prompt with bounds', () => {
      const value = {
        title: 'Rate your experience',
        description: 'How satisfied are you?',
        options: [
          { data: '1' },
          { data: '2' },
          { data: '3' },
          { data: '4' },
          { data: '5' },
        ],
        bounds: {
          lowerBound: 'Not Satisfied',
          upperBound: 'Very Satisfied',
        },
      };
      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, value);
      expect(prompt).toContain('Rate your experience');
      expect(prompt).toContain('How satisfied are you?');
      expect(prompt).toContain('integer on a linear scale from 1 to 5');
      expect(prompt).toContain('Not Satisfied');
      expect(prompt).toContain('Very Satisfied');
    });

    it('should handle linear scale with 10 options', () => {
      const value = {
        title: 'Rate on scale of 1-10',
        options: Array.from({ length: 10 }, (_, i) => ({ data: `${i + 1}` })),
        bounds: {
          lowerBound: 'Poor',
          upperBound: 'Excellent',
        },
      };
      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, value);
      expect(prompt).toContain('from 1 to 10');
      expect(prompt).toContain('Poor');
      expect(prompt).toContain('Excellent');
    });

    it('should handle missing bounds', () => {
      const value = {
        title: 'Rate',
        options: [{ data: '1' }, { data: '2' }, { data: '3' }],
        bounds: null,
      };
      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, value);
      expect(prompt).toContain('from 1 to 3');
      expect(prompt).toBeTruthy();
    });
  });

  describe('MULTIPLE_CHOICE type prompts', () => {
    it('should generate multiple choice prompt with numbered options', () => {
      const value = {
        title: 'What is your favorite color?',
        description: 'Select one',
        options: [
          { data: 'Red' },
          { data: 'Blue' },
          { data: 'Green' },
          { data: 'Yellow' },
        ],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toContain('What is your favorite color?');
      expect(prompt).toContain('Select one');
      expect(prompt).toContain('1. Red');
      expect(prompt).toContain('2. Blue');
      expect(prompt).toContain('3. Green');
      expect(prompt).toContain('4. Yellow');
      expect(prompt).toContain('exact text of the correct option');
    });

    it('should handle multiple choice with single option', () => {
      const value = {
        title: 'Agree?',
        options: [{ data: 'Yes' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toContain('1. Yes');
    });
  });

  describe('MULTIPLE_CHOICE_WITH_OTHER type prompts', () => {
    it('should generate multiple choice with other option', () => {
      const value = {
        title: 'Preferred programming language?',
        description: 'Choose your primary language',
        options: [{ data: 'JavaScript' }, { data: 'Python' }, { data: 'Java' }],
        other: { data: 'Other' },
      };
      const prompt = promptEngine.getPrompt(
        QType.MULTIPLE_CHOICE_WITH_OTHER,
        value,
      );
      expect(prompt).toContain('Preferred programming language?');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('Python');
      expect(prompt).toContain('Java');
      expect(prompt).toContain('Other');
      expect(prompt).toContain('Other: <Your Answer>');
    });

    it('should handle custom other text', () => {
      const value = {
        title: 'Choose one',
        options: [{ data: 'Option A' }],
        other: { data: 'Something else...' },
      };
      const prompt = promptEngine.getPrompt(
        QType.MULTIPLE_CHOICE_WITH_OTHER,
        value,
      );
      expect(prompt).toContain('Something else...');
    });
  });

  describe('MULTI_CORRECT type prompts', () => {
    it('should generate multi-correct prompt for selecting multiple options', () => {
      const value = {
        title: 'Which of these are prime numbers?',
        description: 'Select all that apply',
        options: [
          { data: '2' },
          { data: '3' },
          { data: '4' },
          { data: '5' },
          { data: '6' },
        ],
      };
      const prompt = promptEngine.getPrompt(QType.MULTI_CORRECT, value);
      expect(prompt).toContain('Which of these are prime numbers?');
      expect(prompt).toContain('Select all that apply');
      expect(prompt).toContain('1. 2');
      expect(prompt).toContain('2. 3');
      expect(prompt).toContain('3. 4');
      expect(prompt).toContain('4. 5');
      expect(prompt).toContain('5. 6');
      expect(prompt).toContain('identify and return only the correct options');
    });
  });

  describe('MULTI_CORRECT_WITH_OTHER type prompts', () => {
    it('should generate multi-correct with other option', () => {
      const value = {
        title: 'Select programming paradigms you use',
        description: 'Multiple selections allowed',
        options: [
          { data: 'Object-Oriented' },
          { data: 'Functional' },
          { data: 'Procedural' },
        ],
        other: { data: 'Other' },
      };
      const prompt = promptEngine.getPrompt(
        QType.MULTI_CORRECT_WITH_OTHER,
        value,
      );
      expect(prompt).toContain('Select programming paradigms you use');
      expect(prompt).toContain('Object-Oriented');
      expect(prompt).toContain('Functional');
      expect(prompt).toContain('Procedural');
      expect(prompt).toContain('Other');
      expect(prompt).toContain('multiple-correct with other');
    });
  });

  describe('DROPDOWN type prompts', () => {
    it('should generate dropdown prompt', () => {
      const value = {
        title: 'Select your country',
        description: 'Choose from the list',
        options: [
          { data: 'USA' },
          { data: 'Canada' },
          { data: 'UK' },
          { data: 'Australia' },
        ],
      };
      const prompt = promptEngine.getPrompt(QType.DROPDOWN, value);
      expect(prompt).toContain('Select your country');
      expect(prompt).toContain('Choose from the list');
      expect(prompt).toContain('USA');
      expect(prompt).toContain('Canada');
      expect(prompt).toContain('UK');
      expect(prompt).toContain('Australia');
      expect(prompt).toContain('most appropriate option');
    });

    it('should handle dropdown with many options', () => {
      const value = {
        title: 'Select state',
        options: Array.from({ length: 50 }, (_, i) => ({
          data: `State ${i + 1}`,
        })),
      };
      const prompt = promptEngine.getPrompt(QType.DROPDOWN, value);
      expect(prompt).toContain('State 1');
      expect(prompt).toContain('State 50');
    });
  });

  describe('CHECKBOX_GRID type prompts', () => {
    it('should generate checkbox grid prompt with rows and columns', () => {
      const value = {
        title: 'Animal Characteristics',
        description: 'Match each animal with its characteristics',
        rowArray: ['Can Fly', 'Lives in Water', 'Is a Mammal', 'Has a Tail'],
        columnArray: ['Lion', 'Eagle', 'Dolphin', 'Kangaroo'],
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      expect(prompt).toContain('Animal Characteristics');
      expect(prompt).toContain('Match each animal with its characteristics');
      expect(prompt).toContain('Can Fly');
      expect(prompt).toContain('Lives in Water');
      expect(prompt).toContain('Is a Mammal');
      expect(prompt).toContain('Has a Tail');
      expect(prompt).toContain('Lion, Eagle, Dolphin, Kangaroo');
      expect(prompt).toContain('checkbox grid question');
      expect(prompt).toContain('Example:');
    });

    it('should handle checkbox grid with empty description', () => {
      const value = {
        title: 'Grid Question',
        rowArray: ['Row1', 'Row2'],
        columnArray: ['Col1', 'Col2'],
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      expect(prompt).toContain('Row1');
      expect(prompt).toContain('Col1, Col2');
    });

    it('should handle single row and column', () => {
      const value = {
        title: 'Simple Grid',
        rowArray: ['Single Row'],
        columnArray: ['Single Column'],
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      expect(prompt).toContain('Single Row');
      expect(prompt).toContain('Single Column');
    });
  });

  describe('MULTIPLE_CHOICE_GRID type prompts', () => {
    it('should generate multiple choice grid prompt', () => {
      const value = {
        title: 'Match people with their designations',
        description: 'Select one option per row',
        rowArray: [
          'Charles Darwin',
          'Lewis Carroll',
          'Albert Einstein',
          'Barkha Dutt',
        ],
        columnArray: ['Scientist', 'Writer', 'Journalist', 'Teacher'],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE_GRID, value);
      expect(prompt).toContain('Match people with their designations');
      expect(prompt).toContain('Select one option per row');
      expect(prompt).toContain('Charles Darwin');
      expect(prompt).toContain('Lewis Carroll');
      expect(prompt).toContain('Albert Einstein');
      expect(prompt).toContain('Barkha Dutt');
      expect(prompt).toContain('Scientist, Writer, Journalist, Teacher');
      expect(prompt).toContain('Multiple Choice Grid');
      expect(prompt).toContain('Example:');
    });

    it('should handle multiple choice grid with minimal data', () => {
      const value = {
        title: 'Quiz',
        rowArray: ['Q1'],
        columnArray: ['A', 'B'],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE_GRID, value);
      expect(prompt).toContain('Q1');
      expect(prompt).toContain('A, B');
    });
  });

  describe('DATE type prompts', () => {
    it('should generate date prompt', () => {
      const value = {
        title: 'When is your birthday?',
        description: 'Enter the date',
      };
      const prompt = promptEngine.getPrompt(QType.DATE, value);
      expect(prompt).toContain('When is your birthday?');
      expect(prompt).toContain('Enter the date');
      expect(prompt).toContain('Provide only the date');
      expect(prompt).toContain('zero-padding');
    });

    it('should handle date with minimal info', () => {
      const value = {
        title: 'Date',
      };
      const prompt = promptEngine.getPrompt(QType.DATE, value);
      expect(prompt).toContain('Date');
      expect(prompt).toBeTruthy();
    });
  });

  describe('TIME type prompts', () => {
    it('should generate time prompt with ISO format', () => {
      const value = {
        title: 'What time do you wake up?',
        description: 'Enter time',
      };
      const prompt = promptEngine.getPrompt(QType.TIME, value);
      expect(prompt).toContain('What time do you wake up?');
      expect(prompt).toContain('Enter time');
      expect(prompt).toContain('ISO 8601');
      expect(prompt).toContain('1970-01-01');
      expect(prompt).toContain('YYYY-MM-DDTHH:mm:ssZ');
      expect(prompt).toContain('Examples:');
    });

    it('should include examples in time prompt', () => {
      const value = { title: 'Time' };
      const prompt = promptEngine.getPrompt(QType.TIME, value);
      expect(prompt).toContain('2:30 PM');
      expect(prompt).toContain('1970-01-01T14:30:00Z');
      expect(prompt).toContain('midnight');
      expect(prompt).toContain('noon');
    });
  });

  describe('TIME_WITH_MERIDIEM type prompts', () => {
    it('should generate time with meridiem prompt', () => {
      const value = {
        title: 'Meeting time',
        description: 'Enter time in 12-hour format',
      };
      const prompt = promptEngine.getPrompt(QType.TIME_WITH_MERIDIEM, value);
      expect(prompt).toContain('Meeting time');
      expect(prompt).toContain('12-hour format');
      expect(prompt).toContain('meridiem (AM/PM)');
      expect(prompt).toContain('1970-01-01');
      expect(prompt).toContain('Examples:');
    });
  });

  describe('DATE_AND_TIME type prompts', () => {
    it('should generate date and time prompt', () => {
      const value = {
        title: 'Event Date and Time',
        description: 'When did it happen?',
      };
      const prompt = promptEngine.getPrompt(QType.DATE_AND_TIME, value);
      expect(prompt).toContain('Event Date and Time');
      expect(prompt).toContain('When did it happen?');
      expect(prompt).toContain('date and time');
      expect(prompt).toContain('zero-padding');
    });
  });

  describe('DATE_TIME_WITH_MERIDIEM type prompts', () => {
    it('should generate datetime with meridiem prompt', () => {
      const value = {
        title: 'Appointment',
        description: 'Date and time with AM/PM',
      };
      const prompt = promptEngine.getPrompt(
        QType.DATE_TIME_WITH_MERIDIEM,
        value,
      );
      expect(prompt).toContain('Appointment');
      expect(prompt).toContain('Date and time with AM/PM');
      expect(prompt).toContain('date and time');
    });
  });

  describe('DURATION type prompts', () => {
    it('should generate duration prompt with examples', () => {
      const value = {
        title: 'How long did it take?',
        description: 'Enter duration',
      };
      const prompt = promptEngine.getPrompt(QType.DURATION, value);
      expect(prompt).toContain('How long did it take?');
      expect(prompt).toContain('Enter duration');
      expect(prompt).toContain('duration as a Date object');
      expect(prompt).toContain('1970-01-01');
      expect(prompt).toContain('Example 1:');
      expect(prompt).toContain('Example 2:');
      expect(prompt).toContain('Example 3:');
    });

    it('should include time conversion examples in duration prompt', () => {
      const value = { title: 'Duration' };
      const prompt = promptEngine.getPrompt(QType.DURATION, value);
      expect(prompt).toContain('52 seconds');
      expect(prompt).toContain('1000 seconds');
      expect(prompt).toContain('16 minutes and 40 seconds');
      expect(prompt).toContain('1970-01-01T00:16:40Z');
    });
  });

  describe('DATE_WITHOUT_YEAR type prompts', () => {
    it('should generate date without year prompt', () => {
      const value = {
        title: 'Anniversary date',
        description: 'Month and day only',
      };
      const prompt = promptEngine.getPrompt(QType.DATE_WITHOUT_YEAR, value);
      expect(prompt).toContain('Anniversary date');
      expect(prompt).toContain('Month and day only');
      expect(prompt).toContain('date and time');
    });
  });

  describe('DATE_TIME_WITHOUT_YEAR type prompts', () => {
    it('should generate datetime without year prompt', () => {
      const value = {
        title: 'Event date and time',
        description: 'No year needed',
      };
      const prompt = promptEngine.getPrompt(
        QType.DATE_TIME_WITHOUT_YEAR,
        value,
      );
      expect(prompt).toContain('Event date and time');
      expect(prompt).toContain('No year needed');
    });
  });

  describe('DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR type prompts', () => {
    it('should generate datetime with meridiem without year prompt', () => {
      const value = {
        title: 'Scheduled time',
        description: 'Month, day and time with AM/PM',
      };
      const prompt = promptEngine.getPrompt(
        QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR,
        value,
      );
      expect(prompt).toContain('Scheduled time');
      expect(prompt).toContain('Month, day and time with AM/PM');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined title', () => {
      const value = {
        title: null,
        description: 'Some description',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT, value as any);
      expect(prompt).toBeTruthy();
    });

    it('should handle undefined options array', () => {
      const value = {
        title: 'Question',
        options: undefined,
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toBeTruthy();
    });

    it('should handle empty options array', () => {
      const value = {
        title: 'Question',
        options: [],
      };
      const prompt = promptEngine.getPrompt(QType.DROPDOWN, value);
      expect(prompt).toContain('Question');
    });

    it('should handle undefined rowArray and columnArray', () => {
      const value = {
        title: 'Grid',
        rowArray: undefined,
        columnArray: undefined,
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      expect(prompt).toBeTruthy();
    });

    it('should handle empty rowArray and columnArray', () => {
      const value = {
        title: 'Grid',
        rowArray: [],
        columnArray: [],
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      expect(prompt).toContain('Grid');
    });
  });

  describe('Prompt quality and format', () => {
    it('should not include markdown formatting in multiple choice prompts', () => {
      const value = {
        title: 'Choose',
        options: [{ data: 'A' }, { data: 'B' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).not.toContain('**');
      expect(prompt).not.toContain('##');
    });

    it('should provide clear instructions in all prompts', () => {
      const textPrompt = promptEngine.getPrompt(QType.TEXT, { title: 'Q' });
      const emailPrompt = promptEngine.getPrompt(QType.TEXT_EMAIL, {
        title: 'Q',
      });
      const choicePrompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, {
        title: 'Q',
        options: [{ data: 'A' }],
      });

      expect(textPrompt.length).toBeGreaterThan(10);
      expect(emailPrompt.length).toBeGreaterThan(10);
      expect(choicePrompt.length).toBeGreaterThan(10);
    });

    it('should include examples where helpful (time prompts)', () => {
      const timePrompt = promptEngine.getPrompt(QType.TIME, { title: 'Time' });
      const durationPrompt = promptEngine.getPrompt(QType.DURATION, {
        title: 'Duration',
      });

      expect(timePrompt).toContain('Example');
      expect(durationPrompt).toContain('Example');
    });

    it('should request specific format for structured data', () => {
      const gridPrompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, {
        title: 'Grid',
        rowArray: ['R1'],
        columnArray: ['C1'],
      });
      const mcGridPrompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE_GRID, {
        title: 'Grid',
        rowArray: ['R1'],
        columnArray: ['C1'],
      });

      expect(gridPrompt).toContain('format');
      expect(mcGridPrompt).toContain('order');
    });
  });

  describe('Options formatting', () => {
    it('should format options with numbers for multiple choice', () => {
      const value = {
        title: 'Q',
        options: [{ data: 'First' }, { data: 'Second' }, { data: 'Third' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toMatch(/1\.\s*First/);
      expect(prompt).toMatch(/2\.\s*Second/);
      expect(prompt).toMatch(/3\.\s*Third/);
    });

    it('should format options with numbers for multi-correct', () => {
      const value = {
        title: 'Q',
        options: [{ data: 'A' }, { data: 'B' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTI_CORRECT, value);
      expect(prompt).toMatch(/1\.\s*A/);
      expect(prompt).toMatch(/2\.\s*B/);
    });

    it('should format options without numbers for dropdown', () => {
      const value = {
        title: 'Q',
        options: [{ data: 'Option1' }, { data: 'Option2' }],
      };
      const prompt = promptEngine.getPrompt(QType.DROPDOWN, value);
      expect(prompt).toContain('Option1');
      expect(prompt).toContain('Option2');
      // Should not have numbered format for dropdown
      expect(prompt).not.toMatch(/1\.\s*Option1/);
    });
  });

  describe('Grid formatting', () => {
    it('should join row options with newlines', () => {
      const value = {
        title: 'Grid',
        rowArray: ['Row A', 'Row B', 'Row C'],
        columnArray: ['Col 1', 'Col 2'],
      };
      const prompt = promptEngine.getPrompt(QType.CHECKBOX_GRID, value);
      // Rows should appear in the prompt
      expect(prompt).toContain('Row A');
      expect(prompt).toContain('Row B');
      expect(prompt).toContain('Row C');
    });

    it('should join column options with commas', () => {
      const value = {
        title: 'Grid',
        rowArray: ['Row 1'],
        columnArray: ['Alpha', 'Beta', 'Gamma'],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE_GRID, value);
      expect(prompt).toContain('Alpha, Beta, Gamma');
    });
  });

  describe('Special characters and encoding', () => {
    it('should handle special characters in titles', () => {
      const value = {
        title: 'What\'s your "favorite" item? [Select one]',
        options: [{ data: 'Item A' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toContain('What\'s your "favorite" item?');
    });

    it('should handle unicode characters', () => {
      const value = {
        title: 'お名前は？ (What is your name?)',
        description: '日本語でも可',
      };
      const prompt = promptEngine.getPrompt(QType.TEXT, value);
      expect(prompt).toContain('お名前は？');
      expect(prompt).toContain('日本語でも可');
    });

    it('should handle emojis in options', () => {
      const value = {
        title: 'Pick your mood',
        options: [
          { data: '😊 Happy' },
          { data: '😢 Sad' },
          { data: '😐 Neutral' },
        ],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toContain('😊 Happy');
      expect(prompt).toContain('😢 Sad');
    });

    it('should handle HTML entities', () => {
      const value = {
        title: 'Calculate: 5 < 10 && 10 > 3',
        options: [{ data: 'True' }, { data: 'False' }],
      };
      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, value);
      expect(prompt).toContain('5 < 10 && 10 > 3');
    });
  });
});
