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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-6.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Thinking is off unless requested. Extended thinking (budget_tokens) is deprecated on this model, so adaptive thinking is used.
const BedrockClaudeOpus4_6Literal = "anthropic.claude-opus-4-6-v1";
const BedrockClaudeOpus4_6Description =
  "Intelligent model for building agents and coding, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: August 2025.";

const BedrockClaudeOpus4_6Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "max"],
  defaultEffort: "high",
  samplingParams: true,
  forcedToolUse: true,
});

const BedrockClaudeOpus4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_6Literal,
  description: BedrockClaudeOpus4_6Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus4_6Config.def,
    schema: BedrockClaudeOpus4_6Config.schema,
  },
  price: pricingData[BedrockClaudeOpus4_6Literal],
});

const BedrockClaudeOpus4_6Options = BaseChatModelOptions;
type BedrockClaudeOpus4_6OptionsType = z.infer<typeof BedrockClaudeOpus4_6Options>;

class BedrockClaudeOpus4_6 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus4_6OptionsType) {
    super(BedrockClaudeOpus4_6Schema, options);
  }
}

export {
  BedrockClaudeOpus4_6,
  BedrockClaudeOpus4_6Literal,
  BedrockClaudeOpus4_6Options,
  BedrockClaudeOpus4_6Schema,
  type BedrockClaudeOpus4_6OptionsType,
};
