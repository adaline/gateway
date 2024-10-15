import { CHAT_CONFIG, SelectStringConfigItem } from "@adaline/provider";

import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";

const responseFormat = SelectStringConfigItem({
  param: "response_format",
  title: CHAT_CONFIG.RESPONSE_FORMAT.title,
  description: CHAT_CONFIG.RESPONSE_FORMAT.description,
  default: "text",
  choices: ["text", "json_object"],
});

const ChatModelResponseFormatConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  responseFormat: responseFormat.def,
});

const ChatModelResponseFormatConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    responseFormat: responseFormat.schema,
  });

export { ChatModelResponseFormatConfigDef, ChatModelResponseFormatConfigSchema };
