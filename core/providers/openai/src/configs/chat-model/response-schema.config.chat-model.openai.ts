import { CHAT_CONFIG, ObjectSchemaConfigItem, SelectStringConfigItem } from "@adaline/provider";
import { ResponseSchema } from "@adaline/types";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";

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

const ChatModelResponseSchemaConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  responseFormat: responseFormat.def,
  responseSchema: responseSchema.def,
});

const ChatModelResponseSchemaConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    responseFormat: responseFormat.schema,
    responseSchema: responseSchema.schema,
  });

export { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema };
