import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffortPro, verbosity } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// Config for gpt-5.2-pro and gpt-5.4-pro (Responses API models).
// Pro models accept only medium/high/xhigh for reasoning_effort — 'none' and 'low' are
// intentionally rejected since pro tiers always engage reasoning.
const ChatModelGPT5ProConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffortPro.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
});

const ChatModelGPT5ProConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffortPro.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
  });

export { ChatModelGPT5ProConfigDef, ChatModelGPT5ProConfigSchema };
