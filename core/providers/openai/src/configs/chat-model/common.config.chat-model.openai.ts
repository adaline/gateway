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
    param: "max_completion_tokens",
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

const reasoningEffort = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls the depth of the model's reasoning before delivering an answer. 'minimal' prioritizes speed, 'high' engages in deep reasoning.",
  default: "medium",
  choices: ["minimal", "low", "medium", "high"],
});

// GPT-5.1 reasoning effort: replaces the legacy 'minimal' with 'none' but does not
// yet include 'xhigh'. Default is 'none'.
// See https://developers.openai.com/api/docs/models/gpt-5.1
const reasoningEffort5_1 = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls the depth of the model's reasoning before delivering an answer. 'none' disables reasoning for fastest responses, 'high' engages the deepest reasoning.",
  default: "none",
  choices: ["none", "low", "medium", "high"],
});

// Shared reasoning effort for gpt-5.2 through gpt-5.4 chat models: adds 'xhigh' on top
// of the 5.1 enum. Default is 'none'. Pro and codex variants use their own enums.
// See https://developers.openai.com/api/docs/models/gpt-5.4
const reasoningEffort5_2Plus = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls the depth of the model's reasoning before delivering an answer. 'none' disables reasoning for fastest responses, 'xhigh' engages the deepest reasoning.",
  default: "none",
  choices: ["none", "low", "medium", "high", "xhigh"],
});

// Reasoning effort for codex variants (gpt-5.2-codex, gpt-5.3-codex). Codex models
// always run with some reasoning, so 'none' and 'minimal' are not accepted.
// See https://developers.openai.com/api/docs/models/gpt-5.3-codex
const reasoningEffortCodex = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls the depth of the model's reasoning before delivering an answer. 'low' is the minimum for codex models; 'xhigh' engages the deepest reasoning.",
  default: "medium",
  choices: ["low", "medium", "high", "xhigh"],
});

// Reasoning effort for pro variants (gpt-5.2-pro, gpt-5.4-pro). Pro tiers are
// reasoning-heavy by design and only expose medium/high/xhigh.
// See https://developers.openai.com/api/docs/models/gpt-5.4-pro
const reasoningEffortPro = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning Effort",
  description:
    "Controls the depth of the model's reasoning before delivering an answer. Pro tiers require at least 'medium' and support up to 'xhigh'.",
  default: "medium",
  choices: ["medium", "high", "xhigh"],
});

const verbosity = SelectStringConfigItem({
  param: "verbosity",
  title: "Verbosity",
  description:
    "Controls the length and detail of the model's responses, independent of reasoning depth. 'low' generates concise answers, 'high' provides comprehensive responses.",
  default: "medium",
  choices: ["low", "medium", "high"],
});

const webSearchTool = SelectBooleanConfigItem({
  param: "webSearch",
  title: "Web Search Tool",
  description: "Controls whether the model searches the web for relevant results before responding.",
  default: false,
});

// Responses API only. Up to 100 domains; subdomains included automatically by OpenAI.
const webSearchAllowedDomains = MultiStringConfigItem({
  param: "webSearchAllowedDomains",
  title: "Web Search Allowed Domains",
  description:
    "Restrict web search to this list of domains. Up to 100 entries; subdomains included automatically. Responses API only — ignored on Chat Completions search-preview SKUs.",
  max: 100,
});

// Responses API only. Default true (live web access). Set false for cached/indexed-only.
const webSearchExternalAccess = SelectBooleanConfigItem({
  param: "webSearchExternalAccess",
  title: "Web Search External Access",
  description:
    "Allow external web access. Set to false to restrict to cached/indexed results. Responses API only. Ignored on web_search_preview.",
  default: true,
});

export {
  frequencyPenalty,
  logProbs,
  maxTokens,
  presencePenalty,
  reasoningEffort,
  reasoningEffort5_1,
  reasoningEffort5_2Plus,
  reasoningEffortCodex,
  reasoningEffortPro,
  seed,
  stop,
  temperature,
  toolChoice,
  topLogProbs,
  topP,
  verbosity,
  webSearchAllowedDomains,
  webSearchExternalAccess,
  webSearchTool,
};
