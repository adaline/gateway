import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5_6ConfigDef, ChatModelGPT5_6ConfigSchema } from "./gpt5-6.config.chat-model.openai";

const ChatModelGPT5_6WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_6ConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5_6WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_6ConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelGPT5_6WithWebSearchConfigDef, ChatModelGPT5_6WithWebSearchConfigSchema };
