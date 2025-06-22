import { reasoningEnabled } from "./common.config.chat-model.google";

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
) =>
  GoogleChatModelResponseSchemaConfigSchema(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP).extend({
    reasoningEnabled: reasoningEnabled.schema,
  });

const ChatModelReasoningConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
) =>
  ({
    ...GoogleChatModelResponseSchemaConfigDef(maxTemperature, defaultTemperature, maxOutputTokens, maxSequences, defaultTopP),
    reasoningEnabled: reasoningEnabled.def,
  });

export { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema };