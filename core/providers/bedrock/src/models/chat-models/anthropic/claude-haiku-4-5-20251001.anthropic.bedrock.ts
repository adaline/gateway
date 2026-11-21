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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-4-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
const BedrockClaudeHaiku4_520251001Literal = "anthropic.claude-haiku-4-5-20251001-v1:0";
const BedrockClaudeHaiku4_520251001Description =
  "Fast and efficient model for high-throughput chat, extraction, and routing workloads, with extended thinking. Features a 200K token context window and 64K max output tokens.";

const BedrockClaudeHaiku4_520251001Config = BedrockAnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000);

const BedrockClaudeHaiku4_520251001Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeHaiku4_520251001Literal,
  description: BedrockClaudeHaiku4_520251001Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeHaiku4_520251001Config.def,
    schema: BedrockClaudeHaiku4_520251001Config.schema,
  },
  price: pricingData[BedrockClaudeHaiku4_520251001Literal],
});

const BedrockClaudeHaiku4_520251001Options = BaseChatModelOptions;
type BedrockClaudeHaiku4_520251001OptionsType = z.infer<typeof BedrockClaudeHaiku4_520251001Options>;

class BedrockClaudeHaiku4_520251001 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeHaiku4_520251001OptionsType) {
    super(BedrockClaudeHaiku4_520251001Schema, options);
  }
}

export {
  BedrockClaudeHaiku4_520251001,
  BedrockClaudeHaiku4_520251001Literal,
  BedrockClaudeHaiku4_520251001Options,
  BedrockClaudeHaiku4_520251001Schema,
  type BedrockClaudeHaiku4_520251001OptionsType,
};
