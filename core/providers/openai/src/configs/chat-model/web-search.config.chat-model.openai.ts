import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";
import { webSearchContextSize, webSearchTool, webSearchUserLocation } from "./common.config.chat-model.openai";

const ChatModelWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchContextSize: webSearchContextSize.def,
  webSearchUserLocation: webSearchUserLocation.def,
});

const ChatModelWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchContextSize: webSearchContextSize.schema,
    webSearchUserLocation: webSearchUserLocation.schema,
  });

export { ChatModelWebSearchConfigDef, ChatModelWebSearchConfigSchema };
