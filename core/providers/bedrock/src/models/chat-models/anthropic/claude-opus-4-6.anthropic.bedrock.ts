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

const BedrockClaudeOpus4_6Literal = "anthropic.claude-opus-4-6-v1";
const BedrockClaudeOpus4_6Description =
  "Most intelligent model for building agents and coding. Features 128K max output tokens and 1M context window in beta. Training cutoff: August 2025.";

const BedrockClaudeOpus4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_6Literal,
  description: BedrockClaudeOpus4_6Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(128000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(128000, 4).schema,
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
