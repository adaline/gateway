
import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.openai";
import { reasoningEffort, verbosity } from "./common.config.chat-model.openai";

const ChatModelGPT5ConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort.def,
  verbosity: verbosity.def,
});

const ChatModelGPT5ConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort.schema,
    verbosity: verbosity.schema,
  });

export { ChatModelGPT5ConfigDef, ChatModelGPT5ConfigSchema };
