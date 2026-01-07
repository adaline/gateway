import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  GoogleChatModelResponseSchemaConfigDef,
  GoogleChatModelResponseSchemaConfigSchema,
} from "./chat-model";
import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model";

const GoogleChatModelConfigs = {
  base: (maxTemperature: number, defaultTemperature: number, maxOutputTokens: number, maxSequences: number, defaultTopP: number) => ({
    def: ChatModelBaseConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    schema: ChatModelBaseConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  }),
  responseSchema: (maxTemperature: number, defaultTemperature: number, maxOutputTokens: number, maxSequences: number, defaultTopP: number) => ({
    def: GoogleChatModelResponseSchemaConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    schema: GoogleChatModelResponseSchemaConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  }),
  reasoning: (
    maxTemperature: number,
    defaultTemperature: number,
    maxOutputTokens: number,
    maxSequences: number,
    defaultTopP: number,
    minReasoningToken: number,
    maxReasoningToken: number,
  ) => ({
    def: ChatModelReasoningConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP, minReasoningToken, maxReasoningToken),
    schema: ChatModelReasoningConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP, minReasoningToken, maxReasoningToken),
  }),
} as const;

const GoogleEmbeddingModelConfigs = {
  base: (maxDimensions: number) => ({
    def: EmbeddingModelBaseConfigDef(maxDimensions),
    schema: EmbeddingModelBaseConfigSchema(maxDimensions),
  }),
} as const;

export { GoogleChatModelConfigs, GoogleEmbeddingModelConfigs };
