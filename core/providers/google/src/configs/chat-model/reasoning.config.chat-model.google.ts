import { includeThoughts, maxReasoningTokens, reasoningEffort } from "./common.config.chat-model.google";

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
) =>
  GoogleChatModelResponseSchemaConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP).extend({
    includeThoughts: includeThoughts.schema,
    maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).schema,
    reasoningEffort: reasoningEffort.schema,
  });

const ChatModelReasoningConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  minReasoningToken: number,
  maxReasoningToken: number,
) =>
  ({
    ...GoogleChatModelResponseSchemaConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    includeThoughts: includeThoughts.def,
    maxReasoningTokens: maxReasoningTokens(minReasoningToken, maxReasoningToken).def,
    reasoningEffort: reasoningEffort.def,
  });

export { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema };
