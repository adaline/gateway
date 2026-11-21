import {
  ChatModelBaseConfigDef,
  ChatModelBaseConfigSchema,
  ChatModelReasoningEffortLowMediumHighConfigDef,
  ChatModelReasoningEffortLowMediumHighConfigSchema,
  ChatModelReasoningEffortNoneLowMediumHighConfigDef,
  ChatModelReasoningEffortNoneLowMediumHighConfigSchema,
} from "./chat-model";

const GroqChatModelConfigs = {
  base: (maxOutputTokens: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens),
    schema: ChatModelBaseConfigSchema(maxOutputTokens),
  }),
  reasoningEffortLowMediumHigh: (maxOutputTokens: number) => ({
    def: ChatModelReasoningEffortLowMediumHighConfigDef(maxOutputTokens),
    schema: ChatModelReasoningEffortLowMediumHighConfigSchema(maxOutputTokens),
  }),
  reasoningEffortNoneLowMediumHigh: (maxOutputTokens: number) => ({
    def: ChatModelReasoningEffortNoneLowMediumHighConfigDef(maxOutputTokens),
    schema: ChatModelReasoningEffortNoneLowMediumHighConfigSchema(maxOutputTokens),
  }),
} as const;

export { GroqChatModelConfigs };
