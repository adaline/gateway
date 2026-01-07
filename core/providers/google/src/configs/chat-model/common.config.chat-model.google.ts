import {
  CHAT_CONFIG,
  MultiStringConfigItem,
  PairedSelectConfigItem,
  RangeConfigItem,
  SelectBooleanConfigItem,
  SelectStringConfigItem,
} from "@adaline/provider";

const GOOGLE_SAFETY_CATEGORIES = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
  "HARM_CATEGORY_CIVIC_INTEGRITY",
] as const;

const GOOGLE_SAFETY_THRESHOLDS = [
  "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
  "BLOCK_LOW_AND_ABOVE",
  "BLOCK_MEDIUM_AND_ABOVE",
  "BLOCK_ONLY_HIGH",
  "BLOCK_NONE",
  "OFF",
] as const;

const formatSafetyLabel = (value: string, prefix: string) =>
  value
    .replace(prefix, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());

const GOOGLE_SAFETY_CATEGORY_OPTIONS = GOOGLE_SAFETY_CATEGORIES.map((category) => ({
  value: category,
  label: formatSafetyLabel(category, "HARM_CATEGORY_"),
}));

const GOOGLE_SAFETY_THRESHOLD_OPTIONS = GOOGLE_SAFETY_THRESHOLDS.map((threshold) => ({
  value: threshold,
  label: formatSafetyLabel(threshold, "HARM_BLOCK_THRESHOLD_"),
}));

const temperature = (max: number, _default: number) =>
  RangeConfigItem({
    param: "temperature",
    title: CHAT_CONFIG.TEMPERATURE.title,
    description: CHAT_CONFIG.TEMPERATURE.description,
    min: 0.0,
    max: max,
    step: 0.01,
    default: _default,
  });

const maxTokens = (maxOutputTokens: number) =>
  RangeConfigItem({
    param: "maxOutputTokens",
    title: CHAT_CONFIG.MAX_TOKENS.title,
    description: CHAT_CONFIG.MAX_TOKENS.description,
    min: 0,
    max: maxOutputTokens,
    step: 1,
    default: 0,
  });

const stop = (maxSequences: number) =>
  MultiStringConfigItem({
    param: "stopSequences",
    title: CHAT_CONFIG.STOP(maxSequences).title,
    description: CHAT_CONFIG.STOP(maxSequences).description,
    max: maxSequences,
  });

const topP = (_default: number) =>
  RangeConfigItem({
    param: "topP",
    title: CHAT_CONFIG.TOP_P.title,
    description: CHAT_CONFIG.TOP_P.description,
    min: 0,
    max: 1,
    step: 0.01,
    default: _default,
  });

const topK = (_default: number) =>
  RangeConfigItem({
    param: "topK",
    title: CHAT_CONFIG.TOP_K.title,
    description: CHAT_CONFIG.TOP_K.description,
    min: 1,
    max: 40,
    step: 1,
    default: _default,
  });

const frequencyPenalty = RangeConfigItem({
  param: "frequencyPenalty",
  title: CHAT_CONFIG.FREQUENCY_PENALTY.title,
  description: CHAT_CONFIG.FREQUENCY_PENALTY.description,
  min: -2,
  max: 2,
  step: 0.01,
  default: 0,
});

const presencePenalty = RangeConfigItem({
  param: "presencePenalty",
  title: CHAT_CONFIG.PRESENCE_PENALTY.title,
  description: CHAT_CONFIG.PRESENCE_PENALTY.description,
  min: -2,
  max: 2,
  step: 0.01,
  default: 0,
});

const seed = RangeConfigItem({
  param: "seed",
  title: CHAT_CONFIG.SEED.title,
  description: CHAT_CONFIG.SEED.description,
  min: 0,
  max: 1000000,
  step: 1,
  default: 0,
});

const toolChoice = SelectStringConfigItem({
  param: "toolChoice",
  title: "Tool choice",
  description:
    "Controls which (if any) tool is called by the model. 'none' means the model will not call a function. 'auto' means the model can pick between generating a message or calling a tool.",
  default: "auto",
  choices: ["auto", "any", "none"],
});

const safetySettings = PairedSelectConfigItem({
  param: "safetySettings",
  title: "Safety settings",
  description: "The safety rating contains the category of harm and the harm probability level in that category for a piece of content.",
  fields: [
    {
      key: "category",
      label: "Category",
      choices: GOOGLE_SAFETY_CATEGORY_OPTIONS,
    },
    {
      key: "threshold",
      label: "Threshold",
      choices: GOOGLE_SAFETY_THRESHOLD_OPTIONS,
    },
  ],
  uniqueByField: "category",
});

const reasoningEnabled = SelectBooleanConfigItem({
  param: "reasoningEnabled",
  title: "Reasoning Enabled",
  description:
    "Controls whether the model is allowed to think for a longer period of time before generating a response. This can be useful for complex tasks that require more time to think.",
  default: false,
});

const maxReasoningTokens = (minReasoningToken: number, maxReasoningToken: number) =>
  RangeConfigItem({
    param: "thinkingBudget",
    title: "Thinking budget",
    description: "Specify the total tokens for thinking (or reasoning), where one token approximates four English characters.",
    min: minReasoningToken,
    max: maxReasoningToken,
    step: 1,
    default: 0,
  });

const reasoningEffort = SelectStringConfigItem({
  param: "thinkingLevel",
  title: "Thinking Level",
  description:
    "Controls the depth of the model's reasoning process. Higher levels may result in more thorough reasoning but use more tokens.",
  default: "LOW",
  choices: ["LOW", "HIGH"],
});

const googleSearchTool = SelectBooleanConfigItem({
  param: "googleSearch",
  title: "Google Search Tool",
  description: "Controls whether the model is allowed to use the Google Search tool. Powered by Google.",
  default: false,
});

export {
  GOOGLE_SAFETY_CATEGORIES,
  GOOGLE_SAFETY_CATEGORY_OPTIONS,
  GOOGLE_SAFETY_THRESHOLDS,
  GOOGLE_SAFETY_THRESHOLD_OPTIONS,
  frequencyPenalty,
  googleSearchTool,
  maxReasoningTokens,
  maxTokens,
  presencePenalty,
  reasoningEnabled,
  safetySettings,
  seed,
  stop,
  temperature,
  reasoningEffort,
  toolChoice,
  topK,
  topP,
};
