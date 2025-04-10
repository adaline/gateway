import { CHAT_CONFIG, RangeConfigItem, SelectBooleanConfigItem } from "@adaline/provider";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.anthropic";

const maxExtendedThinkingTokens = (maxThinkingTokens: number, minThinkingTokens: number) =>
  RangeConfigItem({
    param: "max_thinking_tokens",
    title: CHAT_CONFIG.MAX_THINKING_TOKENS.title,
    description: CHAT_CONFIG.MAX_THINKING_TOKENS.description,
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
  maxThinkingTokens: number,
  minThinkingTokens: number
) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  extendedThinking: extendedThinking.def,
  maxExtendedThinkingTokens: maxExtendedThinkingTokens(maxThinkingTokens, minThinkingTokens).def,
});

const ChatModelExtendedThinkingConfigSchema = (
  maxOutputTokens: number,
  maxSequences: number,
  maxThinkingTokens: number,
  minThinkingTokens: number
) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    extendedThinking: extendedThinking.schema,
    maxExtendedThinkingTokens: maxExtendedThinkingTokens(maxThinkingTokens, minThinkingTokens).schema,
  });

export { ChatModelExtendedThinkingConfigDef, ChatModelExtendedThinkingConfigSchema };
