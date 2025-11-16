import { QType } from '@utils/questionTypes';

/**
 * Mock LLM responses for different question types
 * These responses simulate what an LLM would return for form filling
 */
export const mockLLMResponses: Record<QType, string> = {
  [QType.TEXT]: 'John Doe',
  [QType.PARAGRAPH]:
    'This is a comprehensive response to the question. It provides detailed information that spans multiple sentences and demonstrates the ability to generate longer form content.',
  [QType.TEXT_EMAIL]: 'john.doe@example.com',
  [QType.TEXT_URL]: 'https://www.example.com',
  [QType.DROPDOWN]: 'Option 2',
  [QType.MULTIPLE_CHOICE]: 'Option B',
  [QType.MULTIPLE_CHOICE_WITH_OTHER]: 'Custom response',
  [QType.MULTI_CORRECT]: 'Option 1, Option 3',
  [QType.MULTI_CORRECT_WITH_OTHER]: 'Option 2, Custom option',
  [QType.LINEAR_SCALE_OR_STAR]: '4',
  [QType.MULTIPLE_CHOICE_GRID]: 'Row 1: Option A, Row 2: Option B',
  [QType.CHECKBOX_GRID]: 'Row 1: Option 1, Option 2; Row 2: Option 1',
  [QType.DATE]: '2024-03-15',
  [QType.DATE_WITHOUT_YEAR]: '03-15',
  [QType.DATE_AND_TIME]: '2024-03-15 14:30',
  [QType.DATE_TIME_WITHOUT_YEAR]: '03-15 14:30',
  [QType.DATE_TIME_WITH_MERIDIEM]: '2024-03-15 02:30 PM',
  [QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR]: '03-15 02:30 PM',
  [QType.TIME]: '14:30',
  [QType.TIME_WITH_MERIDIEM]: '02:30 PM',
  [QType.DURATION]: '02:30:00',
};

/**
 * Mock LLM responses for specific test scenarios
 */
export const mockLLMResponseScenarios = {
  // Personal information
  name: {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
  },

  // Contact information
  contact: {
    email: 'test@example.com',
    phone: '+1-555-0123',
    address: '123 Main Street, Anytown, CA 12345',
  },

  // Professional information
  professional: {
    occupation: 'Software Engineer',
    company: 'Tech Corp',
    experience: '5 years',
  },

  // Educational information
  education: {
    degree: 'Bachelor of Science',
    major: 'Computer Science',
    university: 'State University',
    year: '2019',
  },

  // Invalid/edge case responses
  invalid: {
    empty: '',
    null: null,
    malformed: 'Invalid date format: 2024-13-45',
    tooLong: 'A'.repeat(10000),
  },
};

/**
 * Helper to get mock response for a question type
 */
export function getMockLLMResponse(
  questionType: QType,
  customResponse?: string,
): string {
  return customResponse || mockLLMResponses[questionType];
}

/**
 * Mock LLM Engine class for unit tests
 */
export class MockLLMEngine {
  private responses: Map<string, string> = new Map();

  setResponse(prompt: string, response: string) {
    this.responses.set(prompt, response);
  }

  async getResponse(
    prompt: string,
    questionType: QType,
    _engine?: string,
  ): Promise<string> {
    // Return custom response if set
    if (this.responses.has(prompt)) {
      return this.responses.get(prompt)!;
    }

    // Return default mock response for question type
    return mockLLMResponses[questionType];
  }

  async invokeLLM(prompt: string, questionType: QType): Promise<string> {
    return this.getResponse(prompt, questionType);
  }

  async invokeMagicLLM(questions: string[]): Promise<any> {
    return {
      profile: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: '30',
        occupation: 'Software Engineer',
      },
    };
  }

  reset() {
    this.responses.clear();
  }
}
