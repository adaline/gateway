import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool } from "./common.config.chat-model.openai";
import { ChatModelO1SeriesConfigDef, ChatModelO1SeriesConfigSchema } from "./o-series.config.chat-model.openai";

const ChatModelO1SeriesWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelO1SeriesConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelO1SeriesWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelO1SeriesConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelO1SeriesWithWebSearchConfigDef, ChatModelO1SeriesWithWebSearchConfigSchema };
