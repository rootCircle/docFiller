import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { analyzeWeightedObjects } from '@utils/consensusUtil';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { Settings } from '@utils/settings';

class ConsensusEngine {
  private validateEngine: ValidatorEngine;
  private llmWeights: Map<LLMEngineType, number>;
  private static instance: ConsensusEngine | null = null;

  private constructor() {
    this.validateEngine = new ValidatorEngine();
    this.llmWeights = new Map<LLMEngineType, number>(
      Object.entries(DEFAULT_PROPERTIES.llmWeights) as [
        LLMEngineType,
        number,
      ][],
    );
    this.distributeWeights();
  }

  public static async getInstance(): Promise<ConsensusEngine> {
    if (!ConsensusEngine.instance) {
      ConsensusEngine.instance = new ConsensusEngine();

      const weights = await Settings.getInstance().getConsensusWeights();
      if (weights) {
        ConsensusEngine.instance.llmWeights = new Map<LLMEngineType, number>(
          Object.entries(weights) as [LLMEngineType, number][],
        );
      }
      ConsensusEngine.instance.distributeWeights();
    }

    return ConsensusEngine.instance;
  }

  private distributeWeights() {
    const currentSum = Array.from(this.llmWeights.values()).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    if (Math.abs(currentSum - 1) < 1e-10) {
      return;
    }

    const nonZeroWeights = Array.from(this.llmWeights.values()).filter(
      (w) => w > 0,
    );
    const nonZeroCount = nonZeroWeights.length;

    if (nonZeroCount === 0) {
      return;
    }

    if (currentSum === 0) {
      const equalWeight = 1 / nonZeroCount;
      this.llmWeights.forEach((value, key) => {
        if (value > 0) {
          this.llmWeights.set(key, equalWeight);
        }
      });
      return;
    }

    const scaleFactor = 1 / currentSum;
    this.llmWeights.forEach((value, key) => {
      this.llmWeights.set(key, Math.max(0, value * scaleFactor));
    });
  }

  async generateAndValidate(
    promptString: string,
    extractedValue: ExtractedValue,
    fieldType: QType,
  ): Promise<LLMResponse | null> {
    const responses = [];
    const entries = Array.from(this.llmWeights.entries());
    for (let i = 0; i < entries.length; i++) {
      const [llmType, weight] = entries[i] as [LLMEngineType, number];
      try {
        if (weight === 0) {
          continue;
        }
        const llm = new LLMEngine(llmType);
        const response = await llm.getResponse(
          promptString,
          fieldType,
          llmType,
        );
        if (response !== null) {
          const parsedResponse = this.validateEngine.validate(
            fieldType,
            extractedValue,
            response,
          );
          if (parsedResponse === true) {
            responses.push({
              source: llmType,
              weight,
              value: response ?? {},
            });
          }
        }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging error in consensus engine
        console.error(error);
      }
    }

    return analyzeWeightedObjects(responses);
  }
}

export { ConsensusEngine };
