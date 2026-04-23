import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5_1ConfigDef, ChatModelGPT5_1ConfigSchema } from "./gpt5-1.config.chat-model.openai";

const ChatModelGPT5_1WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_1ConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5_1WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_1ConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelGPT5_1WithWebSearchConfigDef, ChatModelGPT5_1WithWebSearchConfigSchema };
