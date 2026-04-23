import { webSearchContextSize, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelGPT5ProConfigDef, ChatModelGPT5ProConfigSchema } from "./gpt5-pro.config.chat-model.openai";

const ChatModelGPT5ProWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5ProConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchContextSize: webSearchContextSize.def,
});

const ChatModelGPT5ProWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5ProConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchContextSize: webSearchContextSize.schema,
  });

export { ChatModelGPT5ProWithWebSearchConfigDef, ChatModelGPT5ProWithWebSearchConfigSchema };
