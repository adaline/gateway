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

const ChatModelOSeriesConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  temperature: temperature.def,
});

const ChatModelOSeriesConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    temperature: temperature.schema,
  });

export { ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema };
