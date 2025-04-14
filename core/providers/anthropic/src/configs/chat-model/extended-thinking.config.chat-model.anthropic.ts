import { CHAT_CONFIG, RangeConfigItem, SelectBooleanConfigItem } from "@adaline/provider";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.anthropic";

const maxExtendedThinkingTokens = (minThinkingTokens: number, maxThinkingTokens: number) =>
  RangeConfigItem({
    param: "max_thinking_tokens",
    title: CHAT_CONFIG.MAX_REASONING_TOKENS.title,
    description: CHAT_CONFIG.MAX_REASONING_TOKENS.description,
    min: minThinkingTokens,
    max: maxThinkingTokens,
    step: 1,
    default: 0,
  });

const extendedThinking = SelectBooleanConfigItem({
  param: "extended_thinking",
  title: "Extended thinking",
  description:
    "Controls whether the model is allowed to think for a longer period of time before generating a response. \n This can be useful for complex tasks that require more time to think.",
  default: false,
});

const ChatModelExtendedThinkingConfigDef = (
  maxOutputTokens: number,
  maxSequences: number,
  minThinkingTokens: number,
  maxThinkingTokens: number,
) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  extendedThinking: extendedThinking.def,
  maxExtendedThinkingTokens: maxExtendedThinkingTokens(minThinkingTokens, maxThinkingTokens).def,
});

const ChatModelExtendedThinkingConfigSchema = (
  maxOutputTokens: number,
  maxSequences: number,
  minThinkingTokens: number,
  maxThinkingTokens: number,
) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    extendedThinking: extendedThinking.schema,
    maxExtendedThinkingTokens: maxExtendedThinkingTokens(minThinkingTokens, maxThinkingTokens).schema,
  });

export { ChatModelExtendedThinkingConfigDef, ChatModelExtendedThinkingConfigSchema };
