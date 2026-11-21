import {
  AdaptiveThinkingConfigOptions,
  ChatModelAdaptiveThinkingConfigDef,
  ChatModelAdaptiveThinkingConfigSchema,
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  ExtendedThinkingEffortOptions,
} from "@adaline/anthropic";

import { awsRegionChoice } from "../common.config.chat-model.bedrock";

// Bedrock serves the Anthropic Messages API body, so the Anthropic thinking configs apply unchanged plus the AWS region.

const BedrockAnthropicChatModelExtendedThinkingConfigSchema = (
  maxOutputTokens: number,
  maxSequences: number,
  minReasoningToken: number,
  maxReasoningToken: number,
  effortOptions?: ExtendedThinkingEffortOptions
) =>
  ChatModelReasoningConfigSchema(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningToken, effortOptions).extend({
    awsRegion: awsRegionChoice.schema,
  });

const BedrockAnthropicChatModelExtendedThinkingConfigDef = (
  maxOutputTokens: number,
  maxSequences: number,
  minReasoningToken: number,
  maxReasoningToken: number,
  effortOptions?: ExtendedThinkingEffortOptions
) =>
  ({
    ...ChatModelReasoningConfigDef(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningToken, effortOptions),
    awsRegion: awsRegionChoice.def,
  }) as const;

const BedrockAnthropicChatModelAdaptiveThinkingConfigSchema = (options: AdaptiveThinkingConfigOptions) =>
  ChatModelAdaptiveThinkingConfigSchema(options).extend({
    awsRegion: awsRegionChoice.schema,
  });

const BedrockAnthropicChatModelAdaptiveThinkingConfigDef = (options: AdaptiveThinkingConfigOptions) =>
  ({
    ...ChatModelAdaptiveThinkingConfigDef(options),
    awsRegion: awsRegionChoice.def,
  }) as const;

export {
  BedrockAnthropicChatModelAdaptiveThinkingConfigDef,
  BedrockAnthropicChatModelAdaptiveThinkingConfigSchema,
  BedrockAnthropicChatModelExtendedThinkingConfigDef,
  BedrockAnthropicChatModelExtendedThinkingConfigSchema,
};
