import { CHAT_CONFIG, MultiStringConfigItem, RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

const temperature = RangeConfigItem({
  param: "temperature",
  title: CHAT_CONFIG.TEMPERATURE.title,
  description: CHAT_CONFIG.TEMPERATURE.description,
  min: 0,
  max: 2,
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

const stop = MultiStringConfigItem({
  param: "stop",
  title: CHAT_CONFIG.STOP(4).title,
  description: CHAT_CONFIG.STOP(4).description,
  max: 4,
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

const frequencyPenalty = RangeConfigItem({
  param: "frequency_penalty",
  title: CHAT_CONFIG.FREQUENCY_PENALTY.title,
  description: CHAT_CONFIG.FREQUENCY_PENALTY.description,
  min: -2,
  max: 2,
  step: 0.01,
  default: 0,
});

const presencePenalty = RangeConfigItem({
  param: "presence_penalty",
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

const responseFormat = SelectStringConfigItem({
  param: "response_format",
  title: CHAT_CONFIG.RESPONSE_FORMAT.title,
  description: CHAT_CONFIG.RESPONSE_FORMAT.description,
  default: "text",
  choices: ["text", "json_object"],
});

const toolChoice = SelectStringConfigItem({
  param: "tool_choice",
  title: "Tool choice",
  description:
    "Controls which (if any) tool is called by the model. \
    'none' means the model will not call a function. \
    'auto' means the model can pick between generating a message or calling a tool.",
  default: "auto",
  choices: ["auto", "required", "none"],
});

export { frequencyPenalty, maxTokens, presencePenalty, seed, stop, temperature, toolChoice, topP, responseFormat };
