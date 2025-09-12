import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelGPT5ConfigDef,
  ChatModelGPT5ConfigSchema,
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
  gpt5: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelGPT5ConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelGPT5ConfigSchema(maxOutputTokens, maxSequences),
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
