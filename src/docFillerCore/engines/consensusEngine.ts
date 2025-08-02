import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { analyzeWeightedObjects } from '@utils/consensusUtil';
import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';

class ConsensusEngine {
  private validateEngine: ValidatorEngine;
  private llmWeights: Map<LLMEngineType, number>;

  public constructor() {
    this.validateEngine = new ValidatorEngine();
    this.llmWeights = new Map<LLMEngineType, number>(
      Object.entries(DEFAULT_PROPERTIES.llmWeights) as [
        LLMEngineType,
        number,
      ][],
    );
    this.distributeWeights();
  }

  private distributeWeights() {
    const currentSum = Array.from(this.llmWeights.values()).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    if (currentSum === 1) {
      return;
    }

    const nonZeroCount = Array.from(this.llmWeights.values()).filter(
      (w) => w > 0,
    ).length;
    const adjustment =
      (1 - currentSum) / (nonZeroCount ?? this.llmWeights.size);
    this.llmWeights.forEach((value, key) => {
      if (value > 0) {
        this.llmWeights.set(key, value + adjustment);
      }
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
