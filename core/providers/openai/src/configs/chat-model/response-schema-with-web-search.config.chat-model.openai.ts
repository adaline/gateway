import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool, webSearchUserLocation } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

const ChatModelResponseSchemaWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchUserLocation: webSearchUserLocation.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelResponseSchemaWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchUserLocation: webSearchUserLocation.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelResponseSchemaWithWebSearchConfigDef, ChatModelResponseSchemaWithWebSearchConfigSchema };
