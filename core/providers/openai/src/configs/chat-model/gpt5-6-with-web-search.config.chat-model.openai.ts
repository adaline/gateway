import { webSearchAllowedDomains, webSearchExternalAccessDefaultOff, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5_6ConfigDef, ChatModelGPT5_6ConfigSchema } from "./gpt5-6.config.chat-model.openai";

// GPT-5.6 is default-deny on live web access: external_web_access stays off unless the
// caller explicitly sets webSearchExternalAccess: true.
const ChatModelGPT5_6WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_6ConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccessDefaultOff.def,
});

const ChatModelGPT5_6WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_6ConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccessDefaultOff.schema,
  });

export { ChatModelGPT5_6WithWebSearchConfigDef, ChatModelGPT5_6WithWebSearchConfigSchema };
