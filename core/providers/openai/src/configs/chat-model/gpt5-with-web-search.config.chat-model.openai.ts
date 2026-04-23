import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5ConfigDef, ChatModelGPT5ConfigSchema } from "./gpt5.config.chat-model.openai";

const ChatModelGPT5WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelGPT5WithWebSearchConfigDef, ChatModelGPT5WithWebSearchConfigSchema };
