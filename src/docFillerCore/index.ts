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
import { getStorageItem, setStorageItem } from '@utils/storage/storageHelper';

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
      const existingCustom =
        (await getStorageItem<Profiles>('customProfiles')) || {};
      await setStorageItem('customProfiles', {
        ...existingCustom,
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
