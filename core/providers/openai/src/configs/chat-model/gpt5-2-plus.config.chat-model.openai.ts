import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffort5_2Plus, verbosity } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// Config for gpt-5.2 through gpt-5.4 chat models (excluding codex and pro variants).
// Uses the reasoning_effort enum that OpenAI introduced in 5.2: none/low/medium/high/xhigh,
// default 'none'. gpt-5.4 kept the same enum as 5.2.
const ChatModelGPT5_2PlusConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort5_2Plus.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
});

const ChatModelGPT5_2PlusConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort5_2Plus.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
  });

export { ChatModelGPT5_2PlusConfigDef, ChatModelGPT5_2PlusConfigSchema };
