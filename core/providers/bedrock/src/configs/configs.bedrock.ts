import { AdaptiveThinkingConfigOptions, ExtendedThinkingEffortOptions } from "@adaline/anthropic";

import {
  BedrockAnthropicChatModelBaseConfigDef,
  BedrockAnthropicChatModelBaseConfigSchema,
} from "./chat-model/anthropic/base.config.chat-model.bedrock";
import {
  BedrockAnthropicChatModelAdaptiveThinkingConfigDef,
  BedrockAnthropicChatModelAdaptiveThinkingConfigSchema,
  BedrockAnthropicChatModelExtendedThinkingConfigDef,
  BedrockAnthropicChatModelExtendedThinkingConfigSchema,
} from "./chat-model/anthropic/thinking.config.chat-model.bedrock";

const BedrockAnthropicChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: BedrockAnthropicChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: BedrockAnthropicChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
  // Manual extended thinking: thinking: { type: "enabled", budget_tokens }.
  extendedThinking: (
    maxOutputTokens: number,
    maxSequences: number,
    minReasoningToken: number,
    maxReasoningTokens: number,
    effortOptions?: ExtendedThinkingEffortOptions
  ) => ({
    def: BedrockAnthropicChatModelExtendedThinkingConfigDef(
      maxOutputTokens,
      maxSequences,
      minReasoningToken,
      maxReasoningTokens,
      effortOptions
    ),
    schema: BedrockAnthropicChatModelExtendedThinkingConfigSchema(
      maxOutputTokens,
      maxSequences,
      minReasoningToken,
      maxReasoningTokens,
      effortOptions
    ),
  }),
  // Adaptive thinking: thinking: { type: "adaptive" | "disabled" | "between_tools" } plus output_config.effort.
  adaptiveThinking: (options: AdaptiveThinkingConfigOptions) => ({
    def: BedrockAnthropicChatModelAdaptiveThinkingConfigDef(options),
    schema: BedrockAnthropicChatModelAdaptiveThinkingConfigSchema(options),
  }),
} as const;

export { BedrockAnthropicChatModelConfigs };
