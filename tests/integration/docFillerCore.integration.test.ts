import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QType } from '@utils/questionTypes';

import { PromptEngine } from '@docFillerCore/engines/promptEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { FillerEngine } from '@docFillerCore/engines/fillerEngine';
import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { LLMEngineType } from '@utils/llmEngineTypes';

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
  let llmEngine: LLMEngine;

  beforeEach(() => {
    promptEngine = new PromptEngine();
    validatorEngine = new ValidatorEngine();
    fillerEngine = new FillerEngine();
    
    const apiKey = process.env['GOOGLE_API_KEY'] || process.env['GEMINI_API_KEY'] || '';
    llmEngine = new LLMEngine(LLMEngineType.Gemini, { geminiApiKey: apiKey });
  });

  describe('Prompt → LLM → Validate → Fill Integration', () => {
    it('should handle TEXT field flow with real Gemini API', async () => {
      const input = document.createElement('input');
      const field: ExtractedValue = { dom: input, title: 'What is the capital of France?' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('What is the capital of France?');

      // Call real Gemini API
      const response = await llmEngine.invokeLLM(prompt, QType.TEXT);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toBe(response?.text);
      expect(input.value.toLowerCase()).toContain('paris');
    }, 30000); // 30 second timeout for API call

    it('should handle DATE field flow with real Gemini API', async () => {
      const day = document.createElement('input');
      const month = document.createElement('input');
      const year = document.createElement('input');
      const field: ExtractedValue = {
        title: 'When was the first moon landing? (Apollo 11)',
        date: day,
        month,
        year,
      };

      const prompt = promptEngine.getPrompt(QType.DATE, field);
      expect(prompt).toContain('When was the first moon landing?');

      // Call real Gemini API
      const response = await llmEngine.invokeLLM(prompt, QType.DATE);
      expect(response).toBeTruthy();
      expect(response?.date).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.DATE, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.DATE, field, response);
      // Apollo 11 landed on July 20, 1969
      expect(year.value).toBe('1969');
      expect(month.value).toBe('07');
      expect(day.value).toBe('20');
    }, 30000);

    it('should handle LINEAR_SCALE flow with real Gemini API', async () => {
      const opts = [1, 2, 3, 4, 5].map(n => ({
        dom: document.createElement('div'),
        data: String(n),
      }));
      const field: ExtractedValue = {
        title: 'How satisfied are you with this product?',
        options: opts,
        bounds: { lowerBound: 'Very Unsatisfied', upperBound: 'Very Satisfied' },
      };

      const prompt = promptEngine.getPrompt(QType.LINEAR_SCALE_OR_STAR, field);
      expect(prompt).toContain('How satisfied are you with this product?');
      expect(prompt).toContain('Very Unsatisfied');

      // Call real Gemini API
      const response = await llmEngine.invokeLLM(prompt, QType.LINEAR_SCALE_OR_STAR);
      expect(response).toBeTruthy();
      expect(response?.linearScale).toBeTruthy();
      expect(response?.linearScale?.answer).toBeGreaterThanOrEqual(1);
      expect(response?.linearScale?.answer).toBeLessThanOrEqual(5);

      if (!response) return;

      const valid = validatorEngine.validate(
        QType.LINEAR_SCALE_OR_STAR,
        field,
        response,
      );
      expect(valid).toBe(true);
    }, 30000);

    it('should handle EMAIL field flow with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.className = 'whsOnd zHQkBf';
      input.setAttribute('autocomplete', 'email');
      input.setAttribute('aria-label', 'Your email');
      input.required = true;

      const field: ExtractedValue = { dom: input, title: 'Your professional email address' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('email');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();
      expect(response?.text).toMatch(/@/);

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toBe(response?.text);
      expect(input.value).toMatch(/@/);
    }, 30000);

    it('should handle DATE input field flow with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'date';
      input.className = 'whsOnd zHQkBf';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('max', '2075-01-01');

      const field: ExtractedValue = { dom: input, title: 'When did the Titanic sink? (exact date)' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('Titanic');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toContain('1912-04-');
    }, 30000);

    it('should handle NUMBER field flow (hour) with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'whsOnd zHQkBf';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('aria-label', 'Hour');
      input.setAttribute('min', '1');
      input.setAttribute('max', '12');
      input.setAttribute('role', 'combobox');

      const field: ExtractedValue = { dom: input, title: 'Enter a number: What hour does noon occur? (Answer with just the number 12)' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('noon');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toContain('12');
    }, 30000);

    it('should handle NUMBER field flow (minute) with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'whsOnd zHQkBf';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('aria-label', 'Minute');
      input.setAttribute('min', '0');
      input.setAttribute('max', '59');
      input.setAttribute('role', 'combobox');

      const field: ExtractedValue = { dom: input, title: 'Enter a number: How many minutes in half an hour? (Answer with just the number 30)' };

      const prompt = promptEngine.getPrompt(QType.TEXT, field);
      expect(prompt).toContain('minutes');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT, field, response);
      expect(input.value).toContain('30');
    }, 30000);

    it('should handle DROPDOWN field flow with real Gemini API', async () => {
      const option1 = document.createElement('div');
      option1.className = 'MocG8c HZ3kWc mhLiyf LMgvRb KKjvXb DEh1R';
      option1.setAttribute('data-value', '');
      option1.setAttribute('aria-selected', 'true');
      option1.setAttribute('role', 'option');
      option1.innerHTML = '<span class="vRMGwf oJeWuf">Choose</span>';

      const option2 = document.createElement('div');
      option2.className = 'MocG8c HZ3kWc mhLiyf OIC90c LMgvRb';
      option2.setAttribute('data-value', 'Praveen');
      option2.setAttribute('aria-selected', 'false');
      option2.setAttribute('role', 'option');
      option2.innerHTML = '<span class="vRMGwf oJeWuf">Praveen</span>';

      const option3 = document.createElement('div');
      option3.className = 'MocG8c HZ3kWc mhLiyf OIC90c LMgvRb';
      option3.setAttribute('data-value', 'Charles Babbage');
      option3.setAttribute('aria-selected', 'false');
      option3.setAttribute('role', 'option');
      option3.innerHTML = '<span class="vRMGwf oJeWuf">Charles Babbage</span>';

      const field: ExtractedValue = {
        title: 'Who is called the Father of Computers',
        options: [
          { dom: option1, data: '' },
          { dom: option2, data: 'Praveen' },
          { dom: option3, data: 'Charles Babbage' },
        ],
      };

      const prompt = promptEngine.getPrompt(QType.DROPDOWN, field);
      expect(prompt).toContain('Who is called the Father of Computers');
      expect(prompt).toContain('Praveen');
      expect(prompt).toContain('Charles Babbage');

      // Call real Gemini API
      const response = await llmEngine.invokeLLM(prompt, QType.DROPDOWN);
      expect(response).toBeTruthy();
      expect(response?.genericResponse).toBeTruthy();
      expect(response?.genericResponse?.answer).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.DROPDOWN, field, response);
      expect(valid).toBe(true);
      
      // Gemini should choose Charles Babbage as the correct answer
      expect(response?.genericResponse?.answer.toLowerCase()).toContain('babbage');
    }, 30000);

    it('should handle PARAGRAPH field flow with real Gemini API', async () => {
      const textarea = document.createElement('textarea');
      textarea.className = 'KHxj8b tL9Q4c';
      textarea.setAttribute('aria-label', 'Your answer');
      textarea.setAttribute('data-rows', '1');
      textarea.style.height = '24px';

      const field: ExtractedValue = { dom: textarea, title: 'Write one sentence about the internet' };

      const prompt = promptEngine.getPrompt(QType.PARAGRAPH, field);
      expect(prompt).toContain('internet');

      const response = await llmEngine.invokeLLM(prompt, QType.PARAGRAPH);
      expect(response).toBeTruthy();
      expect(response?.text).toBeTruthy();
      expect(response?.text ? response.text.length : 0).toBeGreaterThan(10);

      if (!response) return;

      const valid = validatorEngine.validate(QType.PARAGRAPH, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.PARAGRAPH, field, response);
      expect(textarea.value).toBe(response?.text);
    }, 30000);

    it('should handle MULTIPLE_CHOICE field flow with real Gemini API', async () => {
      const radio1 = document.createElement('div');
      radio1.id = 'i27';
      radio1.className = 'Od2TWd hYsg7c';
      radio1.setAttribute('aria-label', 'Red');
      radio1.setAttribute('data-value', 'Red');
      radio1.setAttribute('role', 'radio');
      radio1.setAttribute('aria-checked', 'false');

      const radio2 = document.createElement('div');
      radio2.id = 'i30';
      radio2.className = 'Od2TWd hYsg7c';
      radio2.setAttribute('aria-label', 'Blue');
      radio2.setAttribute('data-value', 'Blue');
      radio2.setAttribute('role', 'radio');
      radio2.setAttribute('aria-checked', 'false');

      const radio3 = document.createElement('div');
      radio3.id = 'i33';
      radio3.className = 'Od2TWd hYsg7c';
      radio3.setAttribute('aria-label', 'Green');
      radio3.setAttribute('data-value', 'Green');
      radio3.setAttribute('role', 'radio');
      radio3.setAttribute('aria-checked', 'false');

      const field: ExtractedValue = {
        title: 'What is the color of the sky on a clear day?',
        options: [
          { dom: radio1, data: 'Red' },
          { dom: radio2, data: 'Blue' },
          { dom: radio3, data: 'Green' },
        ],
      };

      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE, field);
      expect(prompt).toContain('sky');

      const response = await llmEngine.invokeLLM(prompt, QType.MULTIPLE_CHOICE);
      expect(response).toBeTruthy();
      expect(response?.multipleChoice).toBeTruthy();
      expect(response?.multipleChoice?.optionText).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.MULTIPLE_CHOICE, field, response);
      expect(valid).toBe(true);
      
      expect(response?.multipleChoice?.optionText?.toLowerCase()).toContain('blue');
    }, 30000);

    it('should handle MULTIPLE_CHOICE_WITH_OTHER field flow with real Gemini API', async () => {
      const radio1 = document.createElement('div');
      radio1.className = 'Od2TWd hYsg7c';
      radio1.setAttribute('data-value', 'Dog');
      radio1.setAttribute('role', 'radio');
      radio1.setAttribute('aria-checked', 'false');

      const radio2 = document.createElement('div');
      radio2.className = 'Od2TWd hYsg7c';
      radio2.setAttribute('data-value', 'Cat');
      radio2.setAttribute('role', 'radio');
      radio2.setAttribute('aria-checked', 'false');

      const radioOther = document.createElement('div');
      radioOther.className = 'Od2TWd hYsg7c';
      radioOther.setAttribute('data-value', '__other_option__');
      radioOther.setAttribute('role', 'radio');
      radioOther.setAttribute('aria-checked', 'false');

      const otherInput = document.createElement('input');
      otherInput.type = 'text';
      otherInput.className = 'Hvn9fb zHQkBf';
      otherInput.setAttribute('aria-label', 'Other response');

      const field: ExtractedValue = {
        title: 'What is your favorite pet?',
        options: [
          { dom: radio1, data: 'Dog' },
          { dom: radio2, data: 'Cat' },
          { dom: radioOther, data: '__other_option__' },
        ],
        other: { inputBoxDom: otherInput, data: '' },
      };

      const prompt = promptEngine.getPrompt(QType.MULTIPLE_CHOICE_WITH_OTHER, field);
      expect(prompt).toContain('pet');

      const response = await llmEngine.invokeLLM(prompt, QType.MULTIPLE_CHOICE_WITH_OTHER);
      expect(response).toBeTruthy();
      expect(response?.multipleChoice).toBeTruthy();

      if (!response) return;

      const valid = validatorEngine.validate(QType.MULTIPLE_CHOICE_WITH_OTHER, field, response);
      expect(valid).toBe(true);
    }, 30000);

    it('should handle MULTI_CORRECT (checkboxes) field flow with real Gemini API', async () => {
      const checkbox1 = document.createElement('div');
      checkbox1.className = 'uVccjd aiSeRd FXLARc wGQFbe';
      checkbox1.setAttribute('role', 'checkbox');
      checkbox1.setAttribute('aria-checked', 'false');
      checkbox1.setAttribute('aria-label', 'JavaScript');

      const checkbox2 = document.createElement('div');
      checkbox2.className = 'uVccjd aiSeRd FXLARc wGQFbe';
      checkbox2.setAttribute('role', 'checkbox');
      checkbox2.setAttribute('aria-checked', 'false');
      checkbox2.setAttribute('aria-label', 'Python');

      const checkbox3 = document.createElement('div');
      checkbox3.className = 'uVccjd aiSeRd FXLARc wGQFbe';
      checkbox3.setAttribute('role', 'checkbox');
      checkbox3.setAttribute('aria-checked', 'false');
      checkbox3.setAttribute('aria-label', 'Java');

      const field: ExtractedValue = {
        title: 'Which programming languages are used for web development? (Select all)',
        options: [
          { dom: checkbox1, data: 'JavaScript' },
          { dom: checkbox2, data: 'Python' },
          { dom: checkbox3, data: 'Java' },
        ],
      };

      const prompt = promptEngine.getPrompt(QType.MULTI_CORRECT, field);
      expect(prompt).toContain('programming');

      const response = await llmEngine.invokeLLM(prompt, QType.MULTI_CORRECT);
      expect(response).toBeTruthy();
      expect(response?.multiCorrect).toBeTruthy();
      expect(Array.isArray(response?.multiCorrect)).toBe(true);
      if (!response) return;

      const valid = validatorEngine.validate(QType.MULTI_CORRECT, field, response);
      expect(valid).toBe(true);
    }, 30000);

    it('should handle TIME field flow with real Gemini API', async () => {
      const hourInput = document.createElement('input');
      hourInput.type = 'number';
      hourInput.className = 'whsOnd zHQkBf';
      hourInput.setAttribute('aria-label', 'Hour');
      hourInput.setAttribute('min', '1');
      hourInput.setAttribute('max', '12');

      const minuteInput = document.createElement('input');
      minuteInput.type = 'number';
      minuteInput.className = 'whsOnd zHQkBf';
      minuteInput.setAttribute('aria-label', 'Minute');
      minuteInput.setAttribute('min', '0');
      minuteInput.setAttribute('max', '59');

      const field: ExtractedValue = {
        title: 'What time do you usually wake up?',
        hour: hourInput,
        minute: minuteInput,
      };

      const prompt = promptEngine.getPrompt(QType.TIME, field);
      expect(prompt).toContain('wake up');

      const response = await llmEngine.invokeLLM(prompt, QType.TIME);
      expect(response).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.TIME, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TIME, field, response);
      expect(hourInput.value).toBeTruthy();
      expect(minuteInput.value).toBeTruthy();
    }, 30000);

    it('should handle DATE_AND_TIME field flow with real Gemini API', async () => {
      const dayInput = document.createElement('input');
      const monthInput = document.createElement('input');
      const yearInput = document.createElement('input');
      const hourInput = document.createElement('input');
      const minuteInput = document.createElement('input');

      const field: ExtractedValue = {
        title: 'When did the first iPhone launch? (Date and Time of announcement)',
        date: dayInput,
        month: monthInput,
        year: yearInput,
        hour: hourInput,
        minute: minuteInput,
      };

      const prompt = promptEngine.getPrompt(QType.DATE_AND_TIME, field);
      expect(prompt).toContain('iPhone');

      const response = await llmEngine.invokeLLM(prompt, QType.DATE_AND_TIME);
      expect(response).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.DATE_AND_TIME, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.DATE_AND_TIME, field, response);
      expect(yearInput.value).toBe('2007');
    }, 30000);

    it('should handle DURATION field flow with real Gemini API', async () => {
      const hourInput = document.createElement('input');
      hourInput.type = 'number';
      const minuteInput = document.createElement('input');
      minuteInput.type = 'number';
      const secondInput = document.createElement('input');
      secondInput.type = 'number';

      const field: ExtractedValue = {
        title: 'How long is a typical lunch break?',
        hour: hourInput,
        minute: minuteInput,
        second: secondInput,
      };

      const prompt = promptEngine.getPrompt(QType.DURATION, field);
      expect(prompt).toContain('lunch break');

      const response = await llmEngine.invokeLLM(prompt, QType.DURATION);
      expect(response).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.DURATION, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.DURATION, field, response);
      expect(minuteInput.value).toBeTruthy();
    }, 30000);

    it('should handle TEXT_EMAIL validation with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.className = 'whsOnd zHQkBf';

      const field: ExtractedValue = { dom: input, title: 'Your professional work email address' };

      const prompt = promptEngine.getPrompt(QType.TEXT_EMAIL, field);
      expect(prompt).toContain('email');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT_EMAIL);
      expect(response).toBeTruthy();
      expect(response?.genericResponse?.answer).toBeTruthy();
      expect(response?.genericResponse?.answer).toMatch(/@/);

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT_EMAIL, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT_EMAIL, field, response);
      expect(input.value).toMatch(/@/);
    }, 30000);

    it('should handle TEXT_URL validation with real Gemini API', async () => {
      const input = document.createElement('input');
      input.type = 'url';
      input.className = 'whsOnd zHQkBf';

      const field: ExtractedValue = { dom: input, title: 'GitHub profile URL' };

      const prompt = promptEngine.getPrompt(QType.TEXT_URL, field);
      expect(prompt).toContain('GitHub');

      const response = await llmEngine.invokeLLM(prompt, QType.TEXT_URL);
      expect(response).toBeTruthy();
      expect(response?.genericResponse?.answer).toBeTruthy();
      expect(response?.genericResponse?.answer).toMatch(/^https?:\/\//);

      if (!response) return;

      const valid = validatorEngine.validate(QType.TEXT_URL, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TEXT_URL, field, response);
      expect(input.value).toMatch(/^https?:\/\//);
    }, 30000);

    it('should handle DATE_WITHOUT_YEAR field flow with real Gemini API', async () => {
      const monthInput = document.createElement('input');
      const dayInput = document.createElement('input');

      const field: ExtractedValue = {
        title: 'Independence Day in USA (month and day only)',
        month: monthInput,
        date: dayInput,
      };

      const prompt = promptEngine.getPrompt(QType.DATE_WITHOUT_YEAR, field);
      expect(prompt).toContain('Independence Day');

      const response = await llmEngine.invokeLLM(prompt, QType.DATE_WITHOUT_YEAR);
      expect(response).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.DATE_WITHOUT_YEAR, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.DATE_WITHOUT_YEAR, field, response);
      expect(monthInput.value).toBe('07');
      expect(dayInput.value).toBe('04');
    }, 30000);

    it('should handle TIME_WITH_MERIDIEM field flow', async () => {
      const hourInput = document.createElement('input');
      hourInput.type = 'number';
      const minuteInput = document.createElement('input');
      minuteInput.type = 'number';
      
      const meridiemDropdown = document.createElement('div');
      meridiemDropdown.setAttribute('role', 'listbox');
      meridiemDropdown.setAttribute('aria-expanded', 'false');

      const parent = document.createElement('div');
      const optionContainer = document.createElement('div');
      
      const amSpan = document.createElement('span');
      amSpan.textContent = 'AM';
      const amOption = document.createElement('div');
      amOption.appendChild(amSpan);
      
      const pmSpan = document.createElement('span');
      pmSpan.textContent = 'PM';
      const pmOption = document.createElement('div');
      pmOption.appendChild(pmSpan);
      
      optionContainer.appendChild(amOption);
      optionContainer.appendChild(pmOption);
      parent.appendChild(meridiemDropdown);
      parent.appendChild(optionContainer);

      const field: ExtractedValue = {
        title: 'What time do business meetings typically start?',
        hour: hourInput,
        minute: minuteInput,
        meridiem: meridiemDropdown,
      };

      const prompt = promptEngine.getPrompt(QType.TIME_WITH_MERIDIEM, field);
      expect(prompt).toContain('business meetings');

      const response = await llmEngine.invokeLLM(prompt, QType.TIME_WITH_MERIDIEM);
      expect(response).toBeTruthy();
      expect(response?.date).toBeInstanceOf(Date);

      if (!response) return;

      const valid = validatorEngine.validate(QType.TIME_WITH_MERIDIEM, field, response);
      expect(valid).toBe(true);

      await fillerEngine.fill(QType.TIME_WITH_MERIDIEM, field, response);
      expect(hourInput.value).toBeTruthy();
      expect(minuteInput.value).toBeTruthy();
    }, 30000);
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

describe('DocFillerCore Table-Driven Integration Tests', () => {
  let promptEngine: PromptEngine;
  let validatorEngine: ValidatorEngine;
  let fillerEngine: FillerEngine;
  let llmEngine: LLMEngine;

  beforeEach(() => {
    promptEngine = new PromptEngine();
    validatorEngine = new ValidatorEngine();
    fillerEngine = new FillerEngine();
    
    const apiKey = process.env['GOOGLE_API_KEY'] || process.env['GEMINI_API_KEY'] || '';
    llmEngine = new LLMEngine(LLMEngineType.Gemini, { geminiApiKey: apiKey });
  });

  const testCases = [
    {
      name: 'TEXT - Simple question',
      qType: QType.TEXT,
      question: 'What is the capital of France?',
      setupField: () => ({
        dom: document.createElement('input'),
        title: 'What is the capital of France?',
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.text).toBeTruthy();
        expect(response?.text.toLowerCase()).toContain('paris');
      },
    },
    {
      name: 'LINEAR_SCALE - Satisfaction rating',
      qType: QType.LINEAR_SCALE_OR_STAR,
      question: 'How satisfied are you with this product? (1-5)',
      setupField: () => ({
        title: 'How satisfied are you with this product?',
        options: [1, 2, 3, 4, 5].map(n => ({
          dom: document.createElement('div'),
          data: String(n),
        })),
        bounds: { lowerBound: 'Very Unsatisfied', upperBound: 'Very Satisfied' },
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.linearScale?.answer).toBeGreaterThanOrEqual(1);
        expect(response?.linearScale?.answer).toBeLessThanOrEqual(5);
      },
    },
    {
      name: 'MULTIPLE_CHOICE - Sky color',
      qType: QType.MULTIPLE_CHOICE,
      question: 'What is the color of the sky on a clear day?',
      setupField: () => ({
        title: 'What is the color of the sky on a clear day?',
        options: [
          { dom: document.createElement('div'), data: 'Red' },
          { dom: document.createElement('div'), data: 'Blue' },
          { dom: document.createElement('div'), data: 'Green' },
        ],
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.multipleChoice?.optionText.toLowerCase()).toContain('blue');
      },
    },
    {
      name: 'DROPDOWN - Computer inventor',
      qType: QType.DROPDOWN,
      question: 'Who is called the Father of Computers?',
      setupField: () => ({
        title: 'Who is called the Father of Computers',
        options: [
          { dom: document.createElement('div'), data: '' },
          { dom: document.createElement('div'), data: 'Praveen' },
          { dom: document.createElement('div'), data: 'Charles Babbage' },
        ],
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.genericResponse?.answer.toLowerCase()).toContain('babbage');
      },
    },
    {
      name: 'PARAGRAPH - Short description',
      qType: QType.PARAGRAPH,
      question: 'Write one sentence about the internet',
      setupField: () => ({
        dom: document.createElement('textarea'),
        title: 'Write one sentence about the internet',
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.text).toBeTruthy();
        expect(response?.text.length).toBeGreaterThan(10);
      },
    },
    {
      name: 'DATE - Historical event',
      qType: QType.DATE,
      question: 'When was the first moon landing? (Apollo 11)',
      setupField: () => ({
        title: 'When was the first moon landing? (Apollo 11)',
        date: document.createElement('input'),
        month: document.createElement('input'),
        year: document.createElement('input'),
      }),
      validate: (response: LLMResponse | null) => {
        expect(response?.date).toBeInstanceOf(Date);
        const year = response?.date.getFullYear();
        expect(year).toBe(1969);
      },
    },
  ];

  describe('Sequential Tests with Real API', () => {
    for (const testCase of testCases) {
      it(`${testCase.name}`, async () => {
        const field = testCase.setupField();
        
        const prompt = promptEngine.getPrompt(testCase.qType, field);
        expect(prompt).toBeTruthy();
        
        const response = await llmEngine.invokeLLM(prompt, testCase.qType);
        expect(response).toBeTruthy();
        
        if (!response) return;

        const valid = validatorEngine.validate(testCase.qType, field, response);
        expect(valid).toBe(true);
        
        testCase.validate(response);
        
        await fillerEngine.fill(testCase.qType, field, response);
      }, 30000);
    }
  });
});
