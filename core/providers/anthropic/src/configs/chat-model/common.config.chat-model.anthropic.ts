import { CHAT_CONFIG, MultiStringConfigItem, RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

const temperature = RangeConfigItem({
  param: "temperature",
  title: CHAT_CONFIG.TEMPERATURE.title,
  description: CHAT_CONFIG.TEMPERATURE.description,
  min: 0,
  max: 1,
  step: 0.01,
  default: 1,
});

const maxTokens = (maxOutputTokens: number) =>
  RangeConfigItem({
    param: "max_tokens",
    title: CHAT_CONFIG.MAX_TOKENS.title,
    description: CHAT_CONFIG.MAX_TOKENS.description,
    min: 0,
    max: maxOutputTokens,
    step: 1,
    default: 0,
  });

const stop = (maxSequences: number) =>
  MultiStringConfigItem({
    param: "stop_sequences",
    title: CHAT_CONFIG.STOP(maxSequences).title,
    description: CHAT_CONFIG.STOP(maxSequences).description,
    max: maxSequences,
  });

const topP = RangeConfigItem({
  param: "top_p",
  title: CHAT_CONFIG.TOP_P.title,
  description: CHAT_CONFIG.TOP_P.description,
  min: 0,
  max: 1,
  step: 0.01,
  default: 1,
});

const topK = RangeConfigItem({
  param: "top_k",
  title: CHAT_CONFIG.TOP_K.title,
  description: CHAT_CONFIG.TOP_K.description,
  min: 0,
  max: 1,
  step: 0.01,
  default: 1,
});

const toolChoice = SelectStringConfigItem({
  param: "tool_choice",
  title: "Tool choice",
  description:
    "Controls which (if any) tool is called by the model. \
    'any' means the model will call any of the provided tools. \
    'auto' means the model can pick between generating a message or calling a tool.",
  default: "auto",
  choices: ["auto", "any"],
});

export { maxTokens, stop, temperature, toolChoice, topK, topP };
