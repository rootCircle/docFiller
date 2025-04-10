import { DetectBoxType } from '@docFillerCore/detectors/detectBoxType';
import { ConsensusEngine } from '@docFillerCore/engines/consensusEngine';
import { FieldExtractorEngine } from '@docFillerCore/engines/fieldExtractorEngine';
import { FillerEngine } from '@docFillerCore/engines/fillerEngine';
import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { PrefilledChecker } from '@docFillerCore/engines/prefilledChecker';
import { PromptEngine } from '@docFillerCore/engines/promptEngine';
import { QuestionExtractorEngine } from '@docFillerCore/engines/questionExtractorEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { validateLLMConfiguration } from '@utils/missingApiKey';
import { Settings } from '@utils/settings';
import {
  getEnableOpacityOnSkippedQuestions,
  getSkipMarkedSetting,
} from '@utils/storage/getProperties';
import { MetricsManager } from '@utils/storage/metricsManager';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';
import { setStorageItem } from '@utils/storage/storageHelper';
import {
  createResponseFromCache,
  getCachedResponse,
  prepareResponseForCache,
  storeResponse,
} from '@utils/storage/responseCache';
import { getEnableResponseCaching } from '@utils/storage/getProperties';
import { QType } from '@utils/questionTypes';
async function runDocFillerEngine() {
  const questions = new QuestionExtractorEngine().getValidQuestions();

  const checker = new DetectBoxType();
  const fields = new FieldExtractorEngine();
  const prompts = new PromptEngine();
  const validator = new ValidatorEngine();
  const filler = new FillerEngine();
  const isMarked = new PrefilledChecker();
  const enableConsensus = await Settings.getInstance().getEnableConsensus();
  let consensusEngine: ConsensusEngine | null = null;
  let llm: LLMEngine | null = null;
  const metricsManager = MetricsManager.getInstance();
  if (enableConsensus) {
    consensusEngine = await ConsensusEngine.getInstance();
  } else {
    try {
      llm = new LLMEngine(await Settings.getInstance().getCurrentLLMModel());
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: debugging error when creating LLM engine
      console.error(e);
      return;
    }
  }

  type ValidationResult = {
    invalidEngines: string[];
    isConsensusEnabled: boolean;
  };
  const validation = (await validateLLMConfiguration()) as ValidationResult;
  if (validation.invalidEngines.length > 0) {
    // biome-ignore lint/suspicious/noConsole: debugging validation state
    console.log(
      `Consensus is ${validation.isConsensusEnabled ? 'enabled' : 'disabled'}`,
    );
    // biome-ignore lint/suspicious/noConsole: debugging invalid engines
    console.error('Invalid engines:', validation.invalidEngines);
    return;
  }

  const totalQuestions = questions.length;
  metricsManager.incrementTotalQuestions(totalQuestions);

  metricsManager?.startFormFilling(totalQuestions);

  const selectedProfile = await getSelectedProfileKey();
  const profiles = await loadProfiles();
  const settings = Settings.getInstance();

  if (profiles[selectedProfile]?.is_magic) {
    const questionsToSend = [];
    for (const ques of questions) {
      const fieldType = checker.detectType(ques);
      if (fieldType !== null) {
        const fieldValue = fields.getFields(ques, fieldType);
        questionsToSend.push(fieldValue.title);
      }
    }
    const response: { value?: { system_prompt: string } } =
      await chrome.runtime.sendMessage({
        type: 'MAGIC_PROMPT_GEN',
        questions: questionsToSend,
        model: await settings.getCurrentLLMModel(),
      });
    if (response?.value) {
      profiles[selectedProfile].system_prompt = response.value.system_prompt;
    }
    try {
      await setStorageItem('customProfiles', {
        ...profiles,
        [selectedProfile]: {
          ...profiles[selectedProfile],
          system_prompt: response.value?.system_prompt,
        },
      });
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging storage error in docFiller core
      console.error('Failed to save magic prompt to storage:', error);
      // Continue execution even if storage fails
    }
  }

  const enableOpacity = await getEnableOpacityOnSkippedQuestions();

  for (const question of questions) {
    try {
      const fieldType = checker.detectType(question);

      if (fieldType !== null) {
        const fieldValue = fields.getFields(question, fieldType);
        // biome-ignore lint/suspicious/noConsole: debugging form field information
        console.log(question);

        // biome-ignore lint/suspicious/noConsole: debugging field type information
        console.log(`Field Type : ${fieldType}`);

        // biome-ignore lint/suspicious/noConsole: debugging fields label
        console.log('Fields ↴');

        // biome-ignore lint/suspicious/noConsole: debugging field value label
  console.log('Field Value ↴');

  // biome-ignore lint/suspicious/noConsole: debugging field value data
  console.log(fieldValue);

  const isFilled = isMarked.markedCheck(fieldType, fieldValue);
  // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log('Is Already Filled ↴');
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log(isFilled);
        const skipMarkedSettingValue = await getSkipMarkedSetting();
        const enableOpacity = await getEnableOpacityOnSkippedQuestions();
        if (skipMarkedSettingValue && isFilled) {
          if (enableOpacity) {
            question.style.opacity = '0.6';
          }
          // biome-ignore lint/suspicious/noConsole: debugging form filler process
          console.log('Skipping already marked question:', question);
          continue;
        }

        metricsManager.incrementToBeFilledQuestions();
        const enableResponseCaching = await getEnableResponseCaching();
        // if (enableResponseCaching && fieldValue.title) {
        //   const questionText = fieldValue.title;
        //   const questionType = fieldType;

        //   const cachedResponseText = await getCachedResponse(
        //     questionText,
        //     questionType,
        //   );

        //   if (cachedResponseText) {
        //     console.log(
        //       `[CACHE] Using cached response for ${questionType} question:`,
        //       questionText,
        //     );

        //     // Create a proper LLMResponse object based on the question type
        //     let cachedResponse;

        //     // Handle different response formats based on question type
        //     if (
        //       questionType === QType.MULTIPLE_CHOICE ||
        //       questionType === QType.MULTIPLE_CHOICE_WITH_OTHER
        //     ) {
        //       try {
        //         // Try to parse JSON for multiple choice responses
        //         const parsedChoice = JSON.parse(cachedResponseText);
        //         cachedResponse = {
        //           multipleChoice: parsedChoice,
        //         };
        //       } catch (e) {
        //         // Fallback to text if parsing fails
        //         console.log(
        //           '[CACHE] Failed to parse MCQ response, using as text',
        //         );
        //         cachedResponse = { text: cachedResponseText };
        //       }
        //     } else if (
        //       questionType === QType.MULTI_CORRECT ||
        //       questionType === QType.MULTI_CORRECT_WITH_OTHER
        //     ) {
        //       try {
        //         // Try to parse as JSON array for multi-correct responses
        //         const parsedChoices = JSON.parse(cachedResponseText);
        //         cachedResponse = {
        //           multiCorrect: parsedChoices,
        //         };
        //       } catch (e) {
        //         console.log(
        //           '[CACHE] Failed to parse multi-correct response, using as text',
        //         );
        //         cachedResponse = { text: cachedResponseText };
        //       }
        //     } else {
        //       // For text types, just use the text response
        //       cachedResponse = {
        //         text: cachedResponseText,
        //       };
        //     }

        //     const fillerStatus = await filler.fill(
        //       fieldType,
        //       fieldValue,
        //       cachedResponse,
        //     );

        //     // Apply opacity if enabled
        //     if (enableOpacity) {
        //       question.style.opacity = '0.6';
        //     }

        //     // Update metrics
        //     metricsManager.incrementSuccessfulQuestions();
        //     continue;
        //   }
        // }
        if (enableResponseCaching && fieldValue.title) {
          const questionText = fieldValue.title;
          const questionType = fieldType;

          const cachedResponseText = await getCachedResponse(
            questionText,
            questionType,
          );

          if (cachedResponseText) {
            console.log(
              `[CACHE] Using cached response for ${questionType} question:`,
              questionText,
            );

            // Use the helper function to create the appropriate response object
            const cachedResponse = createResponseFromCache(
              cachedResponseText,
              questionType,
            );

            const fillerStatus = await filler.fill(
              fieldType,
              fieldValue,
              cachedResponse,
            );

            // Apply opacity if enabled
            if (enableOpacity) {
              question.style.opacity = '0.6';
            }

            // Update metrics
            metricsManager.incrementSuccessfulQuestions();
            continue;
          }
        }
        metricsManager.incrementToBeFilledQuestions();

        const promptString = prompts.getPrompt(fieldType, fieldValue);
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log('Prompt ↴');
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log(promptString);

        let response = null;

        if (enableConsensus && consensusEngine) {
          response = await consensusEngine.generateAndValidate(
            promptString,
            fieldValue,
            fieldType,
          );
        } else if (llm) {
          response = await llm.getResponse(promptString, fieldType, llm.engine);
        }

        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log('LLM Response ↴');
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log(response);

        if (response === null) {
          // biome-ignore lint/suspicious/noConsole: debugging form filler process
          console.log('No response from LLM');
          continue;
        }
        console.log('kjhkhjk');

        // if (enableResponseCaching && fieldValue.title) {
        //   const questionText = fieldValue.title;
        //   const questionType = fieldType;

        //   // Store the response based on question type
        //   if (
        //     questionType === QType.MULTIPLE_CHOICE ||
        //     questionType === QType.MULTIPLE_CHOICE_WITH_OTHER
        //   ) {
        //     if (response.multipleChoice) {
        //       // Store as JSON string
        //       const mcqJson = JSON.stringify(response.multipleChoice);
        //       await storeResponse(questionText, mcqJson, questionType);
        //       console.log(
        //         `[CACHE] Stored ${questionType} response as JSON in cache for:`,
        //         questionText,
        //       );
        //     } else if (response.text) {
        //       // Fallback to text
        //       await storeResponse(questionText, response.text, questionType);
        //       console.log(
        //         `[CACHE] Stored ${questionType} text response in cache for:`,
        //         questionText,
        //       );
        //     }
        //   } else if (
        //     questionType === QType.MULTI_CORRECT ||
        //     questionType === QType.MULTI_CORRECT_WITH_OTHER
        //   ) {
        //     if (response.multiCorrect) {
        //       // Store as JSON string
        //       const mcJson = JSON.stringify(response.multiCorrect);
        //       await storeResponse(questionText, mcJson, questionType);
        //       console.log(
        //         `[CACHE] Stored ${questionType} response as JSON in cache for:`,
        //         questionText,
        //       );
        //     } else if (response.text) {
        //       await storeResponse(questionText, response.text, questionType);
        //       console.log(
        //         `[CACHE] Stored ${questionType} text response in cache for:`,
        //         questionText,
        //       );
        //     }
        //   } else if (response.text) {

        //     await storeResponse(questionText, response.text, questionType);
        //     console.log(
        //       `[CACHE] Stored ${questionType} response in cache for:`,
        //       questionText,
        //     );
        //   } else {
        //     console.error(
        //       `[CACHE ERROR] Unable to extract response for ${questionType}:`,
        //       questionText,
        //     );
        //   }
        // }
        if (enableResponseCaching && fieldValue.title) {
          const questionText = fieldValue.title;
          const questionType = fieldType;

          // Use the helper function to prepare the response for caching
          const responseToCache = prepareResponseForCache(
            response,
            questionType,
          );

          if (responseToCache) {
            await storeResponse(questionText, responseToCache, questionType);
            console.log(
              `[CACHE] Stored ${questionType} response in cache for:`,
              questionText,
            );
          } else {
            console.error(
              `[CACHE ERROR] Unable to extract response for ${questionType}:`,
              questionText,
            );
          }
        }
        const parsed_response = validator.validate(
          fieldType,
          fieldValue,
          response,
        );
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log(`Parsed Response : ${parsed_response}`);

        if (parsed_response) {
          const fillerStatus = await filler.fill(
            fieldType,
            fieldValue,
            response,
          );
          // biome-ignore lint/suspicious/noConsole: debugging form filler process
          console.log(`Filler Status ${fillerStatus}`);
          //   if (enableResponseCaching && fieldType === QType.TEXT && fillerStatus && response.text && fieldValue.title) {
          //   await storeResponse(fieldValue.title, response.text, 'TEXT');
          // }
          if (fillerStatus) {
            metricsManager.incrementSuccessfulQuestions();
          }
        }
        // biome-ignore lint/suspicious/noConsole: debugging form filler process
        console.log();
      }
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: debugging form filler process
      console.error(e);
    }
  }

  const currentLLMModel = await Settings.getInstance().getCurrentLLMModel();
  await metricsManager.endFormFilling(currentLLMModel);
}

export { runDocFillerEngine };
