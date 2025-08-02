import type { LLMEngineType } from '@utils/llmEngineTypes';

interface WeightedObject {
  source: LLMEngineType;
  weight: number;
  value: LLMResponse;
}

type LLMResponseValue = LLMResponse[keyof LLMResponse];
type FlattenedLLMResponse = { [key: string]: LLMResponseValue };

function createWeightedObjectAnalyzer() {
  return function analyzeWeightedObjects(
    objects: WeightedObject[],
  ): LLMResponse {
    if (objects.length === 0) {
      return {};
    }

    return analyzeObjects(objects);
  };
}

function analyzeObjects(objects: WeightedObject[]): LLMResponse {
  const flattenedObjects: {
    [key: string]: { value: LLMResponseValue; totalWeight: number };
  } = {};

  // Flatten and aggregate weights
  for (const obj of objects) {
    const flattened = flattenObject(obj.value);
    for (const [key, value] of Object.entries(flattened)) {
      if (
        !flattenedObjects[key] ||
        (flattenedObjects[key]?.totalWeight !== undefined &&
          obj.weight > flattenedObjects[key].totalWeight)
      ) {
        flattenedObjects[key] = { value, totalWeight: obj.weight };
      }
    }
  }

  // Reconstruct the nested object
  return unflattenObject(
    Object.fromEntries(
      Object.entries(flattenedObjects).map(([key, { value }]) => [key, value]),
    ),
  );
}

function flattenObject(obj: LLMResponse, prefix = ''): FlattenedLLMResponse {
  return Object.entries(obj).reduce(
    (acc: FlattenedLLMResponse, [key, value]) => {
      const propKey = prefix ? `${prefix}.${key}` : key;
      if (
        Array.isArray(value) ||
        value instanceof Date ||
        typeof value !== 'object' ||
        value === null
      ) {
        acc[propKey] = value as LLMResponseValue;
      } else {
        const flattened = flattenObject(value as LLMResponse, propKey);
        for (const [flattenedKey, flattenedValue] of Object.entries(
          flattened,
        )) {
          acc[flattenedKey] = flattenedValue;
        }
      }
      return acc;
    },
    {},
  );
}

function unflattenObject(obj: FlattenedLLMResponse): LLMResponse {
  const result = {} as LLMResponse;
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    // biome-ignore lint/suspicious/noExplicitAny: dynamic object structure needs any type
    let current: any = result;
    if (typeof current !== 'object') {
      continue;
    }
    for (let i = 0; i < keys.length; i++) {
      const iteratedKey = keys[i];
      if (!iteratedKey) {
        continue;
      }
      if (i === keys.length - 1) {
        current[iteratedKey] = value;
      } else {
        current[iteratedKey] = current[iteratedKey] || {};
        current = current[iteratedKey];
      }
    }
  }
  return result;
}

const analyzeWeightedObjects = createWeightedObjectAnalyzer();

export { analyzeWeightedObjects };
