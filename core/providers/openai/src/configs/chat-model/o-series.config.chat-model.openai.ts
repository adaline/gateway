import { CHAT_CONFIG, RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

const oSeriesTemperature = RangeConfigItem({
  param: "temperature",
  title: CHAT_CONFIG.TEMPERATURE.title,
  description: CHAT_CONFIG.TEMPERATURE.description,
  min: 0,
  max: 2,
  step: 0.01,
  default: 1,
});

// o1 models only support temperature = 1.0
const o1SeriesTemperature = RangeConfigItem({
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
  title: "Reasoning Effort",
  description:
    "Constrains effort on reasoning for reasoning models. Reducing reasoning effort can result in faster responses and fewer tokens used on reasoning in a response.",
  default: "medium",
  choices: ["low", "medium", "high"],
});
const ChatModelOSeriesConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  temperature: oSeriesTemperature.def,
  reasoningEffort: reasoningEffort.def,
});

const ChatModelOSeriesConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    temperature: oSeriesTemperature.schema,
    reasoningEffort: reasoningEffort.schema,
  });

const ChatModelO1SeriesConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  temperature: o1SeriesTemperature.def,
  reasoningEffort: reasoningEffort.def,
});

const ChatModelO1SeriesConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    temperature: o1SeriesTemperature.schema,
    reasoningEffort: reasoningEffort.schema,
  });

export { ChatModelO1SeriesConfigDef, ChatModelO1SeriesConfigSchema, ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema };
