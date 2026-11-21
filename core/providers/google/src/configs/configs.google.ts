import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  ChatModelThinkingLevelConfigDef,
  ChatModelThinkingLevelConfigSchema,
  GoogleChatModelResponseSchemaConfigDef,
  GoogleChatModelResponseSchemaConfigSchema,
  GoogleThinkingLevelType,
} from "./chat-model";
import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model";

const GoogleChatModelConfigs = {
  base: (maxTemperature: number, defaultTemperature: number, maxOutputTokens: number, maxSequences: number, defaultTopP: number) => ({
    def: ChatModelBaseConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    schema: ChatModelBaseConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  }),
  responseSchema: (
    maxTemperature: number,
    defaultTemperature: number,
    maxOutputTokens: number,
    maxSequences: number,
    defaultTopP: number
  ) => ({
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
    thinkingLevels?: readonly GoogleThinkingLevelType[],
    defaultThinkingLevel?: GoogleThinkingLevelType
  ) => ({
    def: ChatModelReasoningConfigDef(
      maxTemperature,
      defaultTemperature,
      maxOutputTokens,
      maxSequences,
      defaultTopP,
      minReasoningToken,
      maxReasoningToken,
      thinkingLevels,
      defaultThinkingLevel
    ),
    schema: ChatModelReasoningConfigSchema(
      maxTemperature,
      defaultTemperature,
      maxOutputTokens,
      maxSequences,
      defaultTopP,
      minReasoningToken,
      maxReasoningToken,
      thinkingLevels,
      defaultThinkingLevel
    ),
  }),
  // Gemini 3.6+ config: no sampling params, no thinking budget, per-model thinking levels.
  thinkingLevel: (
    maxOutputTokens: number,
    maxSequences: number,
    levels: readonly GoogleThinkingLevelType[],
    defaultLevel: GoogleThinkingLevelType
  ) => ({
    def: ChatModelThinkingLevelConfigDef(maxOutputTokens, maxSequences, levels, defaultLevel),
    schema: ChatModelThinkingLevelConfigSchema(maxOutputTokens, maxSequences, levels, defaultLevel),
  }),
} as const;

const GoogleEmbeddingModelConfigs = {
  base: (maxDimensions: number) => ({
    def: EmbeddingModelBaseConfigDef(maxDimensions),
    schema: EmbeddingModelBaseConfigSchema(maxDimensions),
  }),
} as const;

export { GoogleChatModelConfigs, GoogleEmbeddingModelConfigs };
