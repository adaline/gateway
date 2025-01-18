import { CHAT_CONFIG, RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

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

const reasoningEffort = SelectStringConfigItem({
  param: "reasoning_effort",
  title: "Reasoning effort",
  description:
    "Constrains effort on reasoning for reasoning models. Reducing reasoning effort can result in faster responses and fewer tokens used on reasoning in a response.",
  default: "medium",
  choices: ["low", "medium", "high"],
});

const ChatModelOSeriesConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  temperature: temperature.def,
  reasoningEffort: reasoningEffort.def,
});

const ChatModelOSeriesConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    temperature: temperature.schema,
    reasoningEffort: reasoningEffort.schema,
  });

export { ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema };
