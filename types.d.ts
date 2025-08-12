// https://github.com/oven-sh/bun/issues/358#issuecomment-1715648224
/** biome-ignore-all lint/correctness/noUnusedVariables: false positive */

/// <reference lib="dom" />

interface ExtractedValue {
  title?: string;
  description?: string | null;
  dom?: HTMLElement;
  options?: OptionType[];
  other?: OtherOption;
  rowColumnOption?: RowColumnOption[];
  rowArray?: string[];
  columnArray?: string[];
  bounds?: LowerUpperBound;
  date?: HTMLInputElement | null;
  month?: HTMLInputElement | null;
  year?: HTMLInputElement | null;
  hour?: HTMLInputElement | null;
  minute?: HTMLInputElement | null;
  second?: HTMLInputElement | null;
  meridiem?: HTMLElement;
  chromeDateField?: HTMLInputElement | null;
}

interface DOMPointer {
  dom: HTMLElement;
}

interface OptionType {
  dom?: HTMLElement;
  data: string;
}

interface OtherOption extends OptionType {
  inputBoxDom: HTMLInputElement;
}

interface ParamsMultiChoiceOrCorrectResult {
  options: OptionType[];
  other?: OtherOption;
}

interface LowerUpperBound {
  lowerBound: string;
  upperBound: string;
}

interface ParamsLinearScaleResult {
  bounds: LowerUpperBound;
  options: OptionType[];
}

interface ParamsMultipleChoiceGridResult {
  rowColumnOption: RowColumnOption[];
  rowArray: string[];
  columnArray: string[];
}

interface RowColumnOption {
  row: string;
  cols: OptionType[];
}

interface CheckboxGridResult {
  rowColumnOption: RowColumnOption[];
  rowArray: string[];
  columnArray: string[];
}

interface DropdownResult {
  dom?: HTMLElement;
  options: OptionType[];
}

interface DateTimeDomFields {
  date?: HTMLInputElement | null;
  month?: HTMLInputElement | null;
  year?: HTMLInputElement | null;
  hour?: HTMLInputElement | null;
  minute?: HTMLInputElement | null;
  second?: HTMLInputElement | null;
  meridiem?: HTMLElement;
  chromeDateField?: HTMLInputElement | null;
}

interface MultiCorrectOrMultipleOption {
  isOther?: boolean;
  optionText?: string;
  otherOptionValue?: string;
}

interface RowColumn {
  row: string;
  selectedColumn: string;
}

interface GenericLLMResponse {
  answer: string;
}

interface LinearScaleResponse {
  answer: number;
}

interface LLMResponse {
  text?: string;
  genericResponse?: GenericLLMResponse;
  date?: Date;
  multiCorrect?: MultiCorrectOrMultipleOption[];
  multipleChoice?: MultiCorrectOrMultipleOption;
  linearScale?: LinearScaleResponse;
  multipleChoiceGrid?: RowColumn[];
  checkboxGrid?: RowColumnOption[];
  magicPrompt?: MagicPromptResponse;
}

interface Profile {
  system_prompt: string;
  image_url: string;
  name: string;
  short_description: string;
  is_custom: boolean;
  is_magic?: boolean;
}

interface Profiles {
  [key: string]: Profile;
}

interface MetricsData {
  history: MetricsHistory[];
  formMetrics: {
    totalFormsFilled: number;
    successfulFills: number;
    failedFills: number;
    lastFilledDate: string;
    currentStreak: number;
    activeStreak: number;
  };
  timeMetrics: {
    averageTimePerForm: number;
    totalHoursSaved: number;
    totalMinSaved: number;
    totalSecSaved: number;
  };
  aiMetrics: {
    apiCalls: Record<LLMEngineType, number>;
    tokenUsage: Record<LLMEngineType, number>;
    averageResponseTime: Record<LLMEngineType, number>;
  };
}

interface MetricsUpdateParams {
  llmModel: LLMEngineType;
  timeAI: number;
  totalQuestions: number;
  successfulQuestions: number;
  toBeFilledQuestions: number;
  responseTime: number;
}

interface MetricsHistory {
  date: string;
  formsFilled: number;
  timeAI: number;
  totalQuestions: number;
  successfulQuestions: number;
  toBeFilledQuestions: number;
}
