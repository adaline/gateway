import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool, webSearchUserLocation } from "./common.config.chat-model.openai";
import { ChatModelGPT5ProConfigDef, ChatModelGPT5ProConfigSchema } from "./gpt5-pro.config.chat-model.openai";

const ChatModelGPT5ProWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ProConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchUserLocation: webSearchUserLocation.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5ProWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ProConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchUserLocation: webSearchUserLocation.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelGPT5ProWithWebSearchConfigDef, ChatModelGPT5ProWithWebSearchConfigSchema };
