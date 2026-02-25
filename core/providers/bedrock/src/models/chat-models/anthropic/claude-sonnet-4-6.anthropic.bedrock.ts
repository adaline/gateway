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

// Bedrock model ID reference: https://docs.anthropic.com/en/docs/about-claude/models/overview (retrieved 2026-02-25)
const BedrockClaudeSonnet4_6Literal = "anthropic.claude-sonnet-4-6-v1";
const BedrockClaudeSonnet4_6Description =
  "Balanced model for agentic reasoning and coding with strong performance at low latency. Training cutoff: August 2025.";

const BedrockClaudeSonnet4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet4_6Literal,
  description: BedrockClaudeSonnet4_6Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(64000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(64000, 4).schema,
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

