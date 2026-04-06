import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";
import { webSearchContextSize, webSearchTool } from "./common.config.chat-model.openai";

const ChatModelWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchContextSize: webSearchContextSize.def,
});

const ChatModelWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchContextSize: webSearchContextSize.schema,
  });

export { ChatModelWebSearchConfigDef, ChatModelWebSearchConfigSchema };
