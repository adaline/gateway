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

const BedrockClaudeOpus4_7Literal = "anthropic.claude-opus-4-7-v1";
const BedrockClaudeOpus4_7Description =
  "Most intelligent model for building agents and coding. Features 128K max output tokens and 1M context window. Training cutoff: January 2026.";

const BedrockClaudeOpus4_7Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_7Literal,
  description: BedrockClaudeOpus4_7Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(128000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(128000, 4).schema,
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
