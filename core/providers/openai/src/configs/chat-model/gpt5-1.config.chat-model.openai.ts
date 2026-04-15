import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffort5_1, verbosity } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// Config for gpt-5.1. Uses reasoning_effort values none/low/medium/high (default 'none').
// Unlike 5.2+, gpt-5.1 does not support 'xhigh'.
const ChatModelGPT5_1ConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort5_1.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
});

const ChatModelGPT5_1ConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort5_1.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
  });

export { ChatModelGPT5_1ConfigDef, ChatModelGPT5_1ConfigSchema };
