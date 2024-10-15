import { CHAT_CONFIG, RangeConfigItem } from "@adaline/provider";

import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// o1 models only support temperature = 1.0
const temperature = RangeConfigItem({
  param: "temperature",
  title: CHAT_CONFIG.TEMPERATURE.title,
  description: CHAT_CONFIG.TEMPERATURE.description,
  min: 1,
  max: 1,
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

const ChatModelOSeriesConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  temperature: temperature.def,
  maxTokens: maxTokens(maxOutputTokens).def,
});

const ChatModelOSeriesConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
  });

export { ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema };
