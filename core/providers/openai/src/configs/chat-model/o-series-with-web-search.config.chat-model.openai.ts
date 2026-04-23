import { webSearchContextSize, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema } from "./o-series.config.chat-model.openai";

const ChatModelOSeriesWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelOSeriesConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchContextSize: webSearchContextSize.def,
});

const ChatModelOSeriesWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelOSeriesConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchContextSize: webSearchContextSize.schema,
  });

export { ChatModelOSeriesWithWebSearchConfigDef, ChatModelOSeriesWithWebSearchConfigSchema };
