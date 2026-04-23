import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5_2PlusConfigDef, ChatModelGPT5_2PlusConfigSchema } from "./gpt5-2-plus.config.chat-model.openai";

const ChatModelGPT5_2PlusWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_2PlusConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5_2PlusWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_2PlusConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelGPT5_2PlusWithWebSearchConfigDef, ChatModelGPT5_2PlusWithWebSearchConfigSchema };
