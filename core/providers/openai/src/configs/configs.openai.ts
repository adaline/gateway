import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelGPT5_1ConfigDef,
  ChatModelGPT5_1ConfigSchema,
  ChatModelGPT5_1WithWebSearchConfigDef,
  ChatModelGPT5_1WithWebSearchConfigSchema,
  ChatModelGPT5_2PlusConfigDef,
  ChatModelGPT5_2PlusConfigSchema,
  ChatModelGPT5_2PlusWithWebSearchConfigDef,
  ChatModelGPT5_2PlusWithWebSearchConfigSchema,
  ChatModelGPT5CodexConfigDef,
  ChatModelGPT5CodexConfigSchema,
  ChatModelGPT5ConfigDef,
  ChatModelGPT5ConfigSchema,
  ChatModelGPT5ProConfigDef,
  ChatModelGPT5ProConfigSchema,
  ChatModelGPT5ProWithWebSearchConfigDef,
  ChatModelGPT5ProWithWebSearchConfigSchema,
  ChatModelGPT5WithWebSearchConfigDef,
  ChatModelGPT5WithWebSearchConfigSchema,
  ChatModelO1SeriesConfigDef,
  ChatModelO1SeriesConfigSchema,
  ChatModelO1SeriesWithWebSearchConfigDef,
  ChatModelO1SeriesWithWebSearchConfigSchema,
  ChatModelOSeriesConfigDef,
  ChatModelOSeriesConfigSchema,
  ChatModelOSeriesWithWebSearchConfigDef,
  ChatModelOSeriesWithWebSearchConfigSchema,
  ChatModelResponseFormatConfigDef,
  ChatModelResponseFormatConfigSchema,
  ChatModelResponseSchemaConfigDef,
  ChatModelResponseSchemaConfigSchema,
  ChatModelResponseSchemaWithWebSearchConfigDef,
  ChatModelResponseSchemaWithWebSearchConfigSchema,
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
  gpt5_1: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5_1ConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5_1ConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5_2Plus: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5_2PlusConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5_2PlusConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5Codex: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5CodexConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5CodexConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5Pro: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5ProConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5ProConfigSchema(maxOutputTokens, maxSequences),
  }),
  responseSchemaWithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelResponseSchemaWithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelResponseSchemaWithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  oSeriesWithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelOSeriesWithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelOSeriesWithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  o1SeriesWithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelO1SeriesWithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelO1SeriesWithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5WithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5WithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5WithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5_1WithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5_1WithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5_1WithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5_2PlusWithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5_2PlusWithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5_2PlusWithWebSearchConfigSchema(maxOutputTokens, maxSequences),
  }),
  gpt5ProWithWebSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5ProWithWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5ProWithWebSearchConfigSchema(maxOutputTokens, maxSequences),
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
