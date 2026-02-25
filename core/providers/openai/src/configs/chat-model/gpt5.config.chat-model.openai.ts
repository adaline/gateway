
import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffort, verbosity } from "./common.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

const ChatModelGPT5ConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
});

const ChatModelGPT5ConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
  });

const ChatModelGPT5ChatLatestConfigDef = (maxOutputTokens: number, maxSequences: number) => {
  const { toolChoice, ...baseDefWithoutToolChoice } = ChatModelBaseConfigDef(maxOutputTokens, maxSequences);
  return {
    ...baseDefWithoutToolChoice,
    reasoningEffort: reasoningEffort.def,
    verbosity: verbosity.def,
  };
};

const ChatModelGPT5ChatLatestConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences)
    .omit({ toolChoice: true })
    .extend({
      reasoningEffort: reasoningEffort.schema,
      verbosity: verbosity.schema,
    });

export { ChatModelGPT5ChatLatestConfigDef, ChatModelGPT5ChatLatestConfigSchema, ChatModelGPT5ConfigDef, ChatModelGPT5ConfigSchema };
