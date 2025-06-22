import { CHAT_CONFIG, ObjectSchemaConfigItem, SelectStringConfigItem } from "@adaline/provider";
import { ResponseSchema } from "@adaline/types";
import { z } from "zod";

import {
  frequencyPenalty,
  maxTokens,
  presencePenalty,
  safetySettings,
  seed,
  stop,
  temperature,
  toolChoice,
  topK,
  topP,
} from "./common.config.chat-model.google";

const responseSchema = ObjectSchemaConfigItem({
  param: "response_schema",
  title: CHAT_CONFIG.RESPONSE_SCHEMA.title,
  description: CHAT_CONFIG.RESPONSE_SCHEMA.description,
  objectSchema: ResponseSchema,
});

const responseFormat = SelectStringConfigItem({
  param: "response_format",
  title: CHAT_CONFIG.RESPONSE_FORMAT_WITH_SCHEMA.title,
  description: CHAT_CONFIG.RESPONSE_FORMAT_WITH_SCHEMA.description,
  default: "text",
  choices: ["text", "json_object", "json_schema"],
});

const ChatModelResponseSchemaConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  defaultTopK: number
) =>
  ({
    temperature: temperature(maxTemperature, defaultTemperature).def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP(defaultTopP).def,
    topK: topK(defaultTopK).def,
    frequencyPenalty: frequencyPenalty.def,
    presencePenalty: presencePenalty.def,
    seed: seed.def,
    toolChoice: toolChoice.def,
    safetySettings: safetySettings.def,
    responseFormat: responseFormat.def,
    responseSchema: responseSchema.def,
  }) as const;

const ChatModelResponseSchemaConfigSchema = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  defaultTopK: number
) =>
  z.object({
    temperature: temperature(maxTemperature, defaultTemperature).schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP(defaultTopP).schema,
    topK: topK(defaultTopK).schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    toolChoice: toolChoice.schema,
    safetySettings: safetySettings.schema,
    responseFormat: responseFormat.schema,
    responseSchema: responseSchema.schema,
  });

export { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema };
