import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffort5_6, reasoningMode, verbosity } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// Config for the GPT-5.6 family (sol/terra/luna). Reuses the 5.2+ reasoning_effort
// param but with the GPT-5.6 enum (none/minimal/low/medium/high/xhigh, default 'medium'),
// and adds an independent reasoning mode (standard/pro) on top.
const ChatModelGPT5_6ConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort5_6.def,
  reasoningMode: reasoningMode.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
});

const ChatModelGPT5_6ConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort5_6.schema,
    reasoningMode: reasoningMode.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
  });

export { ChatModelGPT5_6ConfigDef, ChatModelGPT5_6ConfigSchema };
