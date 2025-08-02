import { ChatAnthropic } from '@langchain/anthropic';
import { ChromeAI } from '@langchain/community/experimental/llms/chrome_ai';
import {
  StringOutputParser,
  StructuredOutputParser,
} from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { LLMEngineType } from '@utils/llmEngineTypes';
import { QType } from '@utils/questionTypes';
import {
  getAnthropicApiKey,
  getChatGptApiKey,
  getGeminiApiKey,
  getMistralApiKey,
} from '@utils/storage/getProperties';
import { MetricsManager } from '@utils/storage/metricsManager';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';
import { DatetimeOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

type LLMInstance =
  | ChatOpenAI
  | ChatOllama
  | ChatGoogleGenerativeAI
  | ChatAnthropic
  | ChatMistralAI
  | ChromeAI;

type MagicPromptResponse = {
  subject_context: string;
  expertise_level: string;
  system_prompt: string;
};
export class LLMEngine {
  public engine: LLMEngineType;
  private instances: Record<LLMEngineType, LLMInstance | undefined>;
  private apiKeys: Record<string, string | undefined>;

  private metricsManager = MetricsManager.getInstance();

  constructor(engine: LLMEngineType) {
    this.engine = engine;

    this.instances = {
      [LLMEngineType.ChatGPT]: undefined,
      [LLMEngineType.Gemini]: undefined,
      [LLMEngineType.Ollama]: undefined,
      [LLMEngineType.Mistral]: undefined,
      [LLMEngineType.Anthropic]: undefined,
      [LLMEngineType.ChromeAI]: undefined,
    };

    this.apiKeys = {
      chatGptApiKey: undefined,
      geminiApiKey: undefined,
      mistralApiKey: undefined,
      anthropicApiKey: undefined,
    };

    this.fetchApiKeys()
      .then(() => {
        try {
          this.instantiateEngine(this.engine);
        } catch (error) {
          // biome-ignore lint/suspicious/noConsole: debugging error when instantiating engine
          console.error('Error instantiating engine:', error);
        }
      })
      .catch((error) => {
        // biome-ignore lint/suspicious/noConsole: debugging error fetching API keys
        console.error('Error fetching API keys:', error);
      });
  }

  private async fetchApiKeys(): Promise<void> {
    this.apiKeys['chatGptApiKey'] = await getChatGptApiKey();
    this.apiKeys['geminiApiKey'] = await getGeminiApiKey();
    this.apiKeys['mistralApiKey'] = await getMistralApiKey();
    this.apiKeys['anthropicApiKey'] = await getAnthropicApiKey();
  }
  public instantiateEngine(engine: LLMEngineType): LLMInstance {
    switch (engine) {
      case LLMEngineType.ChatGPT:
        this.instances[engine] = new ChatOpenAI({
          model: 'gpt-4.1-mini',
          temperature: 0,
          maxRetries: 2,
          apiKey: this.apiKeys['chatGptApiKey'] as string,
        });
        break;
      case LLMEngineType.Gemini:
        this.instances[engine] = new ChatGoogleGenerativeAI({
          model: 'gemini-2.5-flash-lite',
          temperature: 0,
          maxRetries: 2,
          apiKey: this.apiKeys['geminiApiKey'] as string,
        });
        break;
      case LLMEngineType.Ollama:
        this.instances[engine] = new ChatOllama({
          model: 'qwen3:4b',
          temperature: 0,
          maxRetries: 2,
        });
        break;
      case LLMEngineType.Mistral:
        this.instances[engine] = new ChatMistralAI({
          model: 'mistral-large-latest',
          temperature: 0,
          maxRetries: 2,
          apiKey: this.apiKeys['mistralApiKey'] as string,
        });
        break;
      case LLMEngineType.Anthropic:
        this.instances[engine] = new ChatAnthropic({
          model: 'claude-4-sonnet-latest',
          temperature: 0,
          maxRetries: 2,
          apiKey: this.apiKeys['anthropicApiKey'] as string,
        });
        break;
      case LLMEngineType.ChromeAI:
        this.instances[engine] = new ChromeAI({
          temperature: 0.5,
          topK: 40,
          systemPrompt:
            'You are an expert assistant trained to analyze questions and provide accurate responses. For each question: 1) Understand the question and the required response format. 2) Provide answers that strictly adhere to the specified structure and formatting. 3) Ensure responses are precise, accurate, and consistent. Respond only in English.',
        });
        break;
    }

    return this.instances[engine] as LLMInstance;
  }

  public async getResponse(
    promptText: string,
    questionType: QType,
    engineType: LLMEngineType,
  ): Promise<LLMResponse | null> {
    const item = {
      type: 'API_CALL',
      prompt: promptText,
      questionType,
      model: engineType,
    };

    try {
      const response = await chrome.runtime.sendMessage(item);

      if (!response) {
        throw new Error('No response received from chrome.runtime.sendMessage');
      }

      if (typeof response !== 'object') {
        throw new Error(
          `Invalid response type: expected object, got ${typeof response}`,
        );
      }

      if (response?.error) {
        const errorMessage =
          typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response.error);
        throw new Error(errorMessage);
      }

      return response.value ?? null;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.error('Error getting LLM response ↴');
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.error(error);
      return null;
    }
  }
  async invokeMagicLLM(questions: string[]): Promise<MagicPromptResponse> {
    try {
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.log('Invoking magic LLM with questions:', questions);
      const promptText = `
        Analyze these form questions and generate an optimal system prompt:
        Questions: ${JSON.stringify(questions)}
        Requirements:
        1. Detect the subject area and context
        2. Determine appropriate expertise level
        3. Generate a comprehensive system prompt
        Return the response in this JSON format:
        {
          "subject_context": "detected subject/domain of the form",
          "expertise_level": "required expertise level for responses",
          "system_prompt": "generated system prompt for the context"
        }
      `;
      const response = await this.getMagicResponse(promptText, this.engine);
      if (!response) {
        throw new Error('No response received from LLM');
      }

      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.log('Magic prompt response:', response);
      return {
        subject_context: response.subject_context,
        expertise_level: response.expertise_level,
        system_prompt: response.system_prompt,
      };
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.error('Error in invokeMagicLLM:', error);
      throw error;
    }
  }
  async getMagicResponse(
    promptText: string,
    engineType: LLMEngineType,
  ): Promise<MagicPromptResponse | null> {
    try {
      let modelInstance = this.instances[engineType];
      if (!modelInstance) {
        await this.fetchApiKeys();
        modelInstance = this.instantiateEngine(engineType);
      }
      const expertRoleGeneratorPrompt = `Analyze all questions and create a comprehensive expert role that covers all domains:
"You are an expert specializing in [list all domains based on frequency, e.g., 'primarily mathematics , with additional expertise in music and human rights ']. As a multidisciplinary professional with deep knowledge across these fields, you serve as [list relevant roles, e.g., 'mathematics professor, music theorist, and human rights consultant']. Your extensive experience covers [list key specialties from all domains]. Provide accurate and detailed answers drawing from your comprehensive expertise."
Examples:
- For questions mix (some math, some physics):
"You are an expert specializing primarily in mathematics and physics. As a distinguished professor in mathematical physics, you have extensive experience in calculus, quantum mechanics..."
- For diverse mix (some history, some music, some art):
"You are an expert specializing in history, music, and art. As a cultural historian with strong background in musicology and art history, you have extensive experience in..."
Count and incorporate ALL question domains to ensure comprehensive expertise.`;
      if (modelInstance) {
        const promptTemplate = ChatPromptTemplate.fromMessages([
          ['system', expertRoleGeneratorPrompt],
          ['user', '{question}'],
        ]);
        const parser = StructuredOutputParser.fromZodSchema(
          z.object({
            subject_context: z
              .string()
              .describe('The detected subject/domain of the form'),
            expertise_level: z
              .string()
              .describe('Required expertise level for responses'),
            system_prompt: z
              .string()
              .describe('Generated system prompt for the context'),
          }),
        );
        const chain = RunnableSequence.from([
          promptTemplate,
          modelInstance,
          parser,
        ]);
        const response = await chain.invoke({
          question: promptText,
        });
        return response as MagicPromptResponse;
      }
      return null;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.error('Error in getMagicResponse:', error);
      return null;
    }
  }

  async invokeLLM(
    promptText: string,
    questionType: QType,
  ): Promise<LLMResponse | null> {
    if (!promptText) {
      return null;
    }
    const startTime = performance.now();
    try {
      const parser = this.getParser(questionType);
      let modelInstance = this.instances[this.engine];

      if (!modelInstance) {
        await this.fetchApiKeys();
        modelInstance = this.instantiateEngine(this.engine);
      }

      if (modelInstance) {
        const selectedProfileKey = (await getSelectedProfileKey()).trim();
        const profiles = await loadProfiles();
        const systemPrompt =
          profiles[selectedProfileKey]?.system_prompt ??
          DEFAULT_PROPERTIES.defaultProfile.system_prompt;
        const promptTemplate = ChatPromptTemplate.fromMessages([
          ['system', systemPrompt],
          ['user', '{format_instructions}\n\n\nQuestion:\n{question}'],
        ]);
        const chain = RunnableSequence.from([
          promptTemplate,
          modelInstance,
          parser,
        ]);

        const response = await chain.invoke({
          question: promptText,
          format_instructions: parser.getFormatInstructions(),
        });
        const endTime = performance.now();
        const responseTime = (endTime - startTime) / 1000;
        this.metricsManager.addResponseTime(responseTime);
        return this.patchResponse(response, questionType);
      }
      return null;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging error in LLM engine
      console.error('Error getting response:', error);
      throw error;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: LLM response types are dynamic and need any
  private patchResponse(response: any, questionType: QType): LLMResponse {
    switch (questionType) {
      case QType.DATE:
      case QType.TIME:
      case QType.DATE_AND_TIME:
      case QType.DATE_TIME_WITHOUT_YEAR:
      case QType.DATE_TIME_WITH_MERIDIEM:
      case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
      case QType.DATE_WITHOUT_YEAR:
      case QType.TIME_WITH_MERIDIEM:
      case QType.DURATION:
        return { date: response as Date };
      case QType.LINEAR_SCALE_OR_STAR:
        return { linearScale: response as LinearScaleResponse };
      case QType.MULTIPLE_CHOICE:
      case QType.MULTIPLE_CHOICE_WITH_OTHER:
        return { multipleChoice: response as MultiCorrectOrMultipleOption };
      case QType.MULTI_CORRECT:
      case QType.MULTI_CORRECT_WITH_OTHER:
        return { multiCorrect: response as MultiCorrectOrMultipleOption[] };
      case QType.MULTIPLE_CHOICE_GRID:
        return { multipleChoiceGrid: response as RowColumn[] };
      case QType.CHECKBOX_GRID:
        return { checkboxGrid: response as RowColumnOption[] };
      case QType.TEXT_EMAIL:
      case QType.TEXT_URL:
      case QType.DROPDOWN:
        return { genericResponse: response as GenericLLMResponse };
      case QType.PARAGRAPH:
      case QType.TEXT:
        return { text: response as string };
    }
  }

  private getParser(
    questionType: QType,
    // biome-ignore lint/suspicious/noExplicitAny: LLM response types are dynamic and need any
  ): StructuredOutputParser<any> | DatetimeOutputParser | StringOutputParser {
    switch (questionType) {
      case QType.TEXT:
      case QType.PARAGRAPH:
        return new StringOutputParser();
      case QType.TEXT_EMAIL:
        return StructuredOutputParser.fromNamesAndDescriptions({
          answer:
            'Give Correct Email corresponding to given question or give random@gmail.com',
        });
      case QType.TEXT_URL:
        return StructuredOutputParser.fromNamesAndDescriptions({
          answer: 'Give Correct Url corresponding to given question',
        });
      case QType.DATE:
      case QType.TIME:
      case QType.DATE_AND_TIME:
      case QType.DATE_TIME_WITHOUT_YEAR:
      case QType.DATE_TIME_WITH_MERIDIEM:
      case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
      case QType.DATE_WITHOUT_YEAR:
      case QType.TIME_WITH_MERIDIEM:
      case QType.DURATION:
        return new DatetimeOutputParser();
      case QType.LINEAR_SCALE_OR_STAR:
        return StructuredOutputParser.fromZodSchema(
          z.object({
            answer: z
              .number()
              .describe(
                "The integer answer to the user's question as the key corresponding to the calculated answer",
              ),
          }),
        );
      case QType.DROPDOWN:
        return StructuredOutputParser.fromNamesAndDescriptions({
          answer: "answer to the user's question",
        });
      case QType.CHECKBOX_GRID: {
        const checkboxGridColSchema = z.object({
          data: z
            .string()
            .describe(
              "The name or label of the column in the checkbox grid which is correct as per user's question",
            ),
        });

        const checkboxGridRowSchema = z.object({
          row: z
            .string()
            .describe('The label or name of the row in the checkbox grid'),
          cols: z
            .array(checkboxGridColSchema)
            .describe(
              'The list of correct columns associated with the row to be marked as checked',
            ),
        });

        const checkboxGridArraySchema = z
          .array(checkboxGridRowSchema)
          .describe(
            'An array of rows for the checkbox grid, each with a list of columns',
          );

        return StructuredOutputParser.fromZodSchema(checkboxGridArraySchema);
      }
      case QType.MULTIPLE_CHOICE_GRID: {
        const multipleChoiceGridRowSchema = z.object({
          row: z
            .string()
            .describe(
              'The label or name of the row in the multiple-choice grid',
            ),
          selectedColumn: z
            .string()
            .describe(
              'The column selected for the given row in the multiple-choice grid that is correct as per user question',
            ),
        });

        const multipleChoiceGridArraySchema = z
          .array(multipleChoiceGridRowSchema)
          .describe(
            'An array of rows for the multiple-choice grid, each with a selected column',
          );

        return StructuredOutputParser.fromZodSchema(
          multipleChoiceGridArraySchema,
        );
      }
      case QType.MULTIPLE_CHOICE:
      case QType.MULTIPLE_CHOICE_WITH_OTHER:
      case QType.MULTI_CORRECT:
      case QType.MULTI_CORRECT_WITH_OTHER: {
        const multiCorrectOrMultipleOptionSchema = z
          .object({
            optionText: z
              .string()
              .nullable()
              .optional()
              .describe(
                "The text of the option. Optional if 'isOther' is true.",
              ),
            isOther: z
              .boolean()
              .nullable()
              .optional()
              .describe(
                "Indicates if this is an 'other' option. This field is required.",
              ),
            otherOptionValue: z
              .string()
              .nullable()
              .optional()
              .describe(
                "The value for the 'other' option. Must be provided if 'isOther' is true.",
              ),
          })
          .refine(
            (data) => !data.isOther || (data.isOther && data.otherOptionValue),
            {
              message:
                "'otherOptionValue' must be provided if 'isOther' is true",
              path: ['otherOptionValue'],
            },
          );

        if (
          questionType === QType.MULTI_CORRECT ||
          questionType === QType.MULTI_CORRECT_WITH_OTHER
        ) {
          const multiCorrectOptionsArraySchema = z
            .array(multiCorrectOrMultipleOptionSchema)
            .describe(
              "An array of options for multi-correct or multiple-choice with optional 'other' option",
            );

          return StructuredOutputParser.fromZodSchema(
            multiCorrectOptionsArraySchema,
          );
        }
        // For multiple-choice with optional 'other' option
        return StructuredOutputParser.fromZodSchema(
          multiCorrectOrMultipleOptionSchema.describe(
            "Schema for a single option in multiple-choice with an optional 'other' option",
          ),
        );
      }
    }
  }
}
