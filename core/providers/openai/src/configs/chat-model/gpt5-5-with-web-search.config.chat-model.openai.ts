import { reasoningEffort5_5, reasoningEffortProDefaultHigh } from "./common.config.chat-model.openai";
import {
  ChatModelGPT5_2PlusWithWebSearchConfigDef,
  ChatModelGPT5_2PlusWithWebSearchConfigSchema,
} from "./gpt5-2-plus-with-web-search.config.chat-model.openai";
import {
  ChatModelGPT5ProWithWebSearchConfigDef,
  ChatModelGPT5ProWithWebSearchConfigSchema,
} from "./gpt5-pro-with-web-search.config.chat-model.openai";

// Config for gpt-5.5: identical to the 5.2+ config except reasoning_effort defaults to 'medium'
// (5.2 through 5.4 default to 'none').
const ChatModelGPT5_5WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_2PlusWithWebSearchConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort5_5.def,
});

const ChatModelGPT5_5WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_2PlusWithWebSearchConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort5_5.schema,
  });

// Config for gpt-5.5-pro: identical to the shared pro config except reasoning_effort defaults
// to 'high' (choices stay medium/high/xhigh).
const ChatModelGPT5_5ProWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ProWithWebSearchConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffortProDefaultHigh.def,
});

const ChatModelGPT5_5ProWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ProWithWebSearchConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffortProDefaultHigh.schema,
  });

export {
  ChatModelGPT5_5ProWithWebSearchConfigDef,
  ChatModelGPT5_5ProWithWebSearchConfigSchema,
  ChatModelGPT5_5WithWebSearchConfigDef,
  ChatModelGPT5_5WithWebSearchConfigSchema,
};
