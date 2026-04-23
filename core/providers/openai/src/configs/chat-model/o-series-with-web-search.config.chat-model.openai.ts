import { webSearchAllowedDomains, webSearchExternalAccess, webSearchTool, webSearchUserLocation } from "./common.config.chat-model.openai";
import { ChatModelOSeriesConfigDef, ChatModelOSeriesConfigSchema } from "./o-series.config.chat-model.openai";

const ChatModelOSeriesWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelOSeriesConfigDef(maxOutputTokens, maxSequences),
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchUserLocation: webSearchUserLocation.def,
  webSearchExternalAccess: webSearchExternalAccess.def,
});

const ChatModelOSeriesWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelOSeriesConfigSchema(maxOutputTokens, maxSequences).extend({
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchUserLocation: webSearchUserLocation.schema,
    webSearchExternalAccess: webSearchExternalAccess.schema,
  });

export { ChatModelOSeriesWithWebSearchConfigDef, ChatModelOSeriesWithWebSearchConfigSchema };
