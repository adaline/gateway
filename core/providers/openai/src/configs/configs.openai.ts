import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelGPT5_1ConfigDef,
  ChatModelGPT5_1ConfigSchema,
  ChatModelGPT5_2PlusConfigDef,
  ChatModelGPT5_2PlusConfigSchema,
  ChatModelGPT5CodexConfigDef,
  ChatModelGPT5CodexConfigSchema,
  ChatModelGPT5ConfigDef,
  ChatModelGPT5ConfigSchema,
  ChatModelGPT5ProConfigDef,
  ChatModelGPT5ProConfigSchema,
  ChatModelO1SeriesConfigDef,
  ChatModelO1SeriesConfigSchema,
  ChatModelOSeriesConfigDef,
  ChatModelOSeriesConfigSchema,
  ChatModelResponseFormatConfigDef,
  ChatModelResponseFormatConfigSchema,
  ChatModelResponseSchemaConfigDef,
  ChatModelResponseSchemaConfigSchema,
  ChatModelWebSearchConfigDef,
  ChatModelWebSearchConfigSchema,
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
  webSearch: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelWebSearchConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelWebSearchConfigSchema(maxOutputTokens, maxSequences),
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
