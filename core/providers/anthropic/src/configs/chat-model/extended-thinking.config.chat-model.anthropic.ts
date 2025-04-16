import { CHAT_CONFIG, RangeConfigItem, SelectBooleanConfigItem } from "@adaline/provider";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.anthropic";

const maxReasoningTokens = (minReasoningToken: number, maxReasoningToken: number) =>
  RangeConfigItem({
    param: "max_reasoning_tokens",
    title: CHAT_CONFIG.MAX_REASONING_TOKENS.title,
    description: CHAT_CONFIG.MAX_REASONING_TOKENS.description,
    min: minReasoningToken,
    max: maxReasoningToken,
    step: 1,
    default: 0,
  });

const reasoningEnabled = SelectBooleanConfigItem({
  param: "reasoning_enabled",
  title: "Reasoning Enabled",
  description:
    "Controls whether the model is allowed to think for a longer period of time before generating a response. \n This can be useful for complex tasks that require more time to think.",
  default: false,
});

const ChatModelReasoningConfigDef = (
  maxOutputTokens: number,
  maxSequences: number,
  minReasoningToken: number,
  maxReasoningToken: number
) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEnabled: reasoningEnabled.def,
  maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).def,
});

const ChatModelReasoningConfigSchema = (
  maxOutputTokens: number,
  maxSequences: number,
  minReasoningToken: number,
  maxReasoningToken: number
) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEnabled: reasoningEnabled.schema,
    maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).schema,
  });

export { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema };
