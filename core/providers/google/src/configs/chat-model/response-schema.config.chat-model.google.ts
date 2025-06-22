import { CHAT_CONFIG, ObjectSchemaConfigItem, SelectStringConfigItem } from "@adaline/provider";
import { ResponseSchema } from "@adaline/types";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.google";

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
  choices: ["text", "json_schema"],
});

const GoogleChatModelResponseSchemaConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number
) => ({
  ...ChatModelBaseConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  responseFormat: responseFormat.def,
  responseSchema: responseSchema.def,
});

const GoogleChatModelResponseSchemaConfigSchema = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number
) =>
  ChatModelBaseConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP).extend({
    responseFormat: responseFormat.schema,
    responseSchema: responseSchema.schema,
  });

export { GoogleChatModelResponseSchemaConfigDef, GoogleChatModelResponseSchemaConfigSchema };
