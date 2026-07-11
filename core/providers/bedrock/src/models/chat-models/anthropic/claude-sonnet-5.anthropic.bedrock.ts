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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5.html (retrieved 2026-07-10)
// Pricing: $2.00 / $10.00 per M tokens is AWS PROMOTIONAL launch pricing in effect through 2026-08-31 (the only
// Bedrock-verified price at retrieval time) — https://aws.amazon.com/bedrock/pricing/ (retrieved 2026-07-10)
const BedrockClaudeSonnet5Literal = "anthropic.claude-sonnet-5";
const BedrockClaudeSonnet5Description =
  "Anthropic's most capable Sonnet model, built for coding, agents, and professional work at scale; near-Opus intelligence at Sonnet cost/speed.";

const BedrockClaudeSonnet5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet5Literal,
  description: BedrockClaudeSonnet5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(128000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(128000, 4).schema,
  },
  price: pricingData[BedrockClaudeSonnet5Literal],
});

const BedrockClaudeSonnet5Options = BaseChatModelOptions;
type BedrockClaudeSonnet5OptionsType = z.infer<typeof BedrockClaudeSonnet5Options>;

class BedrockClaudeSonnet5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeSonnet5OptionsType) {
    super(BedrockClaudeSonnet5Schema, options);
  }
}

export {
  BedrockClaudeSonnet5,
  BedrockClaudeSonnet5Literal,
  BedrockClaudeSonnet5Options,
  BedrockClaudeSonnet5Schema,
  type BedrockClaudeSonnet5OptionsType,
};
