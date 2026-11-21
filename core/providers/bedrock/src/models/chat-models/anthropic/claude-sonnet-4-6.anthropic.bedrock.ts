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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-6.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// AWS caps max output at 64K (the Claude API allows 128K). Thinking is off unless requested.
const BedrockClaudeSonnet4_6Literal = "anthropic.claude-sonnet-4-6";
const BedrockClaudeSonnet4_6Description =
  "Balanced model for agentic reasoning and coding with strong performance at low latency, with adaptive thinking. Training cutoff: August 2025.";

const BedrockClaudeSonnet4_6Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 64000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "max"],
  defaultEffort: "high",
  samplingParams: true,
  forcedToolUse: true,
});

const BedrockClaudeSonnet4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet4_6Literal,
  description: BedrockClaudeSonnet4_6Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeSonnet4_6Config.def,
    schema: BedrockClaudeSonnet4_6Config.schema,
  },
  price: pricingData[BedrockClaudeSonnet4_6Literal],
});

const BedrockClaudeSonnet4_6Options = BaseChatModelOptions;
type BedrockClaudeSonnet4_6OptionsType = z.infer<typeof BedrockClaudeSonnet4_6Options>;

class BedrockClaudeSonnet4_6 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeSonnet4_6OptionsType) {
    super(BedrockClaudeSonnet4_6Schema, options);
  }
}

export {
  BedrockClaudeSonnet4_6,
  BedrockClaudeSonnet4_6Literal,
  BedrockClaudeSonnet4_6Options,
  BedrockClaudeSonnet4_6Schema,
  type BedrockClaudeSonnet4_6OptionsType,
};
