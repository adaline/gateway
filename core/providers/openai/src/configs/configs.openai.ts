import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelGPT5ChatLatestConfigDef,
  ChatModelGPT5ChatLatestConfigSchema,
  ChatModelGPT5ConfigDef,
  ChatModelGPT5ConfigSchema,
  ChatModelO1SeriesConfigDef,
  ChatModelO1SeriesConfigSchema,
  ChatModelOSeriesConfigDef,
  ChatModelOSeriesConfigSchema,
  ChatModelResponseFormatConfigDef,
  ChatModelResponseFormatConfigSchema,
  ChatModelResponseSchemaConfigDef,
  ChatModelResponseSchemaConfigSchema,
} from "./chat-model";
import {
  EmbeddingModelBaseConfigDef,
  EmbeddingModelBaseConfigSchema,
  EmbeddingModelDimensionsConfigDef,
  EmbeddingModelDimensionsConfigSchema,
} from "./embedding-model";

const OpenAIChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
  responseFormat: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelResponseFormatConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelResponseFormatConfigSchema(maxOutputTokens, maxSequences),
  }),
  responseSchema: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences),
  }),
  oSeries: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelOSeriesConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelOSeriesConfigSchema(maxOutputTokens, maxSequences),
  }),
  o1Series: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelO1SeriesConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelO1SeriesConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5ConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5ConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5ChatLatest: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5ChatLatestConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5ChatLatestConfigSchema(maxOutputTokens, maxSequences),
  }),
} as const;

const OpenAIEmbeddingModelConfigs = {
  base: () => ({
    def: EmbeddingModelBaseConfigDef(),
    schema: EmbeddingModelBaseConfigSchema(),
  }),
  dimensions: (maxDimensions: number) => ({
    def: EmbeddingModelDimensionsConfigDef(maxDimensions),
    schema: EmbeddingModelDimensionsConfigSchema(maxDimensions),
  }),
} as const;

export { OpenAIChatModelConfigs, OpenAIEmbeddingModelConfigs };
