import { z } from "zod";

import {
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
  AnthropicThinkingChatModelModalities,
  AnthropicThinkingChatModelModalitiesEnum,
} from "@adaline/anthropic";
import { ChatModelSchema } from "@adaline/provider";

import { BedrockAnthropicChatModelConfigs } from "../../../configs";
import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import pricingData from "./../../pricing.json";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-7.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// ID fix: Bedrock never served a "-v1" suffixed ID for Opus 4.7 (that's a transitional exception unique to Opus 4.6).
// Rejects budget_tokens and non-default temperature / top_p / top_k with a 400 error.
const BedrockClaudeOpus4_7Literal = "anthropic.claude-opus-4-7";
const BedrockClaudeOpus4_7Description =
  "Intelligent model for building agents and coding, with adaptive thinking. Features 128K max output tokens and 1M context window. Training cutoff: January 2026.";

const BedrockClaudeOpus4_7Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeOpus4_7Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_7Literal,
  description: BedrockClaudeOpus4_7Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus4_7Config.def,
    schema: BedrockClaudeOpus4_7Config.schema,
  },
  price: pricingData[BedrockClaudeOpus4_7Literal],
});

const BedrockClaudeOpus4_7Options = BaseChatModelOptions;
type BedrockClaudeOpus4_7OptionsType = z.infer<typeof BedrockClaudeOpus4_7Options>;

class BedrockClaudeOpus4_7 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus4_7OptionsType) {
    super(BedrockClaudeOpus4_7Schema, options);
  }
}

export {
  BedrockClaudeOpus4_7,
  BedrockClaudeOpus4_7Literal,
  BedrockClaudeOpus4_7Options,
  BedrockClaudeOpus4_7Schema,
  type BedrockClaudeOpus4_7OptionsType,
};
