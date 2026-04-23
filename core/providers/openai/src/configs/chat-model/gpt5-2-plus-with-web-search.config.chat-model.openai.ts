import { webSearchContextSize, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5_2PlusConfigDef, ChatModelGPT5_2PlusConfigSchema } from "./gpt5-2-plus.config.chat-model.openai";

const ChatModelGPT5_2PlusWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_2PlusConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchContextSize: webSearchContextSize.def,
});

const ChatModelGPT5_2PlusWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_2PlusConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchContextSize: webSearchContextSize.schema,
  });

export { ChatModelGPT5_2PlusWithWebSearchConfigDef, ChatModelGPT5_2PlusWithWebSearchConfigSchema };
