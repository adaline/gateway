import { CHAT_CONFIG, MultiStringConfigItem, RangeConfigItem, SelectBooleanConfigItem, SelectStringConfigItem } from "@adaline/provider";

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

const stop = (maxSequences: number) =>
  MultiStringConfigItem({
    param: "stop",
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

const logProbs = SelectBooleanConfigItem({
  param: "logprobs",
  title: CHAT_CONFIG.LOG_PROBS.title,
  description: CHAT_CONFIG.LOG_PROBS.description,
  default: false,
});

const topLogProbs = RangeConfigItem({
  param: "top_logprobs",
  title: CHAT_CONFIG.TOP_LOG_PROBS.title,
  description: CHAT_CONFIG.TOP_LOG_PROBS.description,
  min: 0,
  max: 20,
  step: 1,
  default: 0,
});

const toolChoice = SelectStringConfigItem({
  param: "tool_choice",
  title: "Tool choice",
  description:
    "Controls which (if any) tool is called by the model. 'none' means the model will not call a function. 'auto' means the model can pick between generating a message or calling a tool.",
  default: "auto",
  choices: ["auto", "required", "none"],
});

const reasoningEffortNoneLow = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls how much time the model spends thinking before responding. 'none' disables extended reasoning for the fastest responses, 'low' uses minimal thinking time for quick responses. Only supported by grok-4.3.",
  default: "low",
  choices: ["none", "low"],
});

// grok-4.5 documents reasoning_effort as 'low' / 'medium' / 'high' with a 'high' default, and
// states the control cannot be disabled — 'none' is intentionally not offered.
// See https://docs.x.ai/developers/model-capabilities/text/reasoning (retrieved 2026-07-29)
const reasoningEffortLowMediumHigh = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls how deeply the model reasons before responding. 'low' spends the least thinking time, 'high' the most. Reasoning cannot be disabled on this model. Only supported by grok-4.5.",
  default: "high",
  choices: ["low", "medium", "high"],
});

// grok-4.20-multi-agent-0309 reuses the reasoning_effort param to select how many agents run
// rather than how deeply each one reasons. xAI documents no default for it, so this item has
// none — a default here would silently pin the agent count on every request.
// See https://docs.x.ai/developers/model-capabilities/text/multi-agent (retrieved 2026-07-29)
const reasoningEffortAgentCount = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Selects how many agents run rather than how deeply the model reasons: 'low' and 'medium' run 4 agents, 'high' and 'xhigh' run 16 agents. xAI documents no default. Only supported by grok-4.20-multi-agent-0309.",
  default: null,
  choices: ["low", "medium", "high", "xhigh"],
});

export {
  frequencyPenalty,
  logProbs,
  maxTokens,
  presencePenalty,
  reasoningEffortAgentCount,
  reasoningEffortLowMediumHigh,
  reasoningEffortNoneLow,
  seed,
  stop,
  temperature,
  toolChoice,
  topLogProbs,
  topP,
};
