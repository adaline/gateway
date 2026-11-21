import {
  GOOGLE_REASONING_THINKING_LEVELS,
  GoogleThinkingLevelType,
  maxReasoningTokens,
  reasoningEnabled,
  thinkingLevel,
} from "./common.config.chat-model.google";
import {
  GoogleChatModelResponseSchemaConfigDef,
  GoogleChatModelResponseSchemaConfigSchema,
} from "./response-schema.config.chat-model.google";

const ChatModelReasoningConfigSchema = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  minReasoningToken: number,
  maxReasoningToken: number,
  thinkingLevels: readonly GoogleThinkingLevelType[] = GOOGLE_REASONING_THINKING_LEVELS,
  defaultThinkingLevel: GoogleThinkingLevelType = "LOW"
) =>
  GoogleChatModelResponseSchemaConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP).extend({
    reasoningEnabled: reasoningEnabled.schema,
    maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).schema,
    reasoningEffort: thinkingLevel(thinkingLevels, defaultThinkingLevel).schema,
  });

const ChatModelReasoningConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  minReasoningToken: number,
  maxReasoningToken: number,
  thinkingLevels: readonly GoogleThinkingLevelType[] = GOOGLE_REASONING_THINKING_LEVELS,
  defaultThinkingLevel: GoogleThinkingLevelType = "LOW"
) => ({
  ...GoogleChatModelResponseSchemaConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
  reasoningEnabled: reasoningEnabled.def,
  maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).def,
  reasoningEffort: thinkingLevel(thinkingLevels, defaultThinkingLevel).def,
});

export { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema };
