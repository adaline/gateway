import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema, ChatModelC1ConfigDef, ChatModelC1ConfigSchema } from "./chat-model";
import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model";

const GoogleChatModelConfigs = {
  base: (maxTemperature: number, defaultTemperature: number, maxOutputTokens: number, maxSequences: number, defaultTopP: number) => ({
    def: ChatModelBaseConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    schema: ChatModelBaseConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  }),
  c1: (
    maxTemperature: number,
    defaultTemperature: number,
    maxOutputTokens: number,
    maxSequences: number,
    defaultTopP: number,
    defaultTopK: number
  ) => ({
    def: ChatModelC1ConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP, defaultTopK),
    schema: ChatModelC1ConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP, defaultTopK),
  }),
} as const;

const GoogleEmbeddingModelConfigs = {
  base: (maxDimensions: number) => ({
    def: EmbeddingModelBaseConfigDef(maxDimensions),
    schema: EmbeddingModelBaseConfigSchema(maxDimensions),
  }),
} as const;

export { GoogleChatModelConfigs, GoogleEmbeddingModelConfigs };
