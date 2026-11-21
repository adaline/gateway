import {
  reasoningEffortHighOnly,
  webSearchAllowedDomains,
  webSearchExternalAccess,
  webSearchTool,
} from "./common.config.chat-model.openai";
import { ChatModelGPT5ProConfigDef, ChatModelGPT5ProConfigSchema } from "./gpt5-pro.config.chat-model.openai";

const ChatModelGPT5ProWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ProConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelGPT5ProWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ProConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

// Config for gpt-5-pro: the shared pro config narrowed to reasoning_effort 'high' only.
const ChatModelGPT5ProHighOnlyWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ProWithWebSearchConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffortHighOnly.def,
});

const ChatModelGPT5ProHighOnlyWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ProWithWebSearchConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffortHighOnly.schema,
  });

export {
  ChatModelGPT5ProHighOnlyWithWebSearchConfigDef,
  ChatModelGPT5ProHighOnlyWithWebSearchConfigSchema,
  ChatModelGPT5ProWithWebSearchConfigDef,
  ChatModelGPT5ProWithWebSearchConfigSchema,
};
