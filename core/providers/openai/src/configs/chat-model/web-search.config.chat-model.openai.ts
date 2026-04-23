import { webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

const ChatModelWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
});

const ChatModelWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
  });

export { ChatModelWebSearchConfigDef, ChatModelWebSearchConfigSchema };
