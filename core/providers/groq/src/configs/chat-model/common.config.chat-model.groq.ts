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

// gpt-oss-20b, gpt-oss-120b and gpt-oss-safeguard-20b accept reasoning_effort 'low' / 'medium' /
// 'high'. Groq documents no default, so none is set and the param is only sent when the caller
// picks a value.
// See https://console.groq.com/docs/reasoning (retrieved 2026-11-20)
const reasoningEffortLowMediumHigh = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls how deeply the model reasons before responding. 'low' spends the least thinking time, 'high' the most. Groq documents no default. Supported by the gpt-oss models.",
  default: null,
  choices: ["low", "medium", "high"],
});

// qwen3.8-27b accepts reasoning_effort 'none' / 'low' / 'medium' / 'high' ('none' switches to
// instruct mode). Groq also accepts 'default', which is deliberately not exposed. No default is
// documented, so none is set.
// See https://console.groq.com/docs/reasoning, https://console.groq.com/docs/model/qwen/qwen3.8-27b (retrieved 2026-11-20)
const reasoningEffortNoneLowMediumHigh = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls how deeply the model reasons before responding. 'none' disables thinking (instruct mode), 'low' to 'high' raise the thinking budget. Groq documents no default. Supported by qwen3.8-27b.",
  default: null,
  choices: ["none", "low", "medium", "high"],
});

export {
  frequencyPenalty,
  maxTokens,
  presencePenalty,
  reasoningEffortLowMediumHigh,
  reasoningEffortNoneLowMediumHigh,
  responseFormat,
  seed,
  stop,
  temperature,
  toolChoice,
  topP,
};
