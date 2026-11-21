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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
const BedrockClaudeOpus4_520251101Literal = "anthropic.claude-opus-4-5-20251101-v1:0";
const BedrockClaudeOpus4_520251101Description =
  "Premium model combining maximum intelligence with practical performance. Ideal for complex specialized tasks, professional software engineering, and advanced agents. Training cutoff: August 2025.";

const BedrockClaudeOpus4_520251101Config = BedrockAnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000, {
  levels: ["low", "medium", "high"],
  default: "high",
});

const BedrockClaudeOpus4_520251101Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_520251101Literal,
  description: BedrockClaudeOpus4_520251101Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus4_520251101Config.def,
    schema: BedrockClaudeOpus4_520251101Config.schema,
  },
  price: pricingData[BedrockClaudeOpus4_520251101Literal],
});

const BedrockClaudeOpus4_520251101Options = BaseChatModelOptions;
type BedrockClaudeOpus4_520251101OptionsType = z.infer<typeof BedrockClaudeOpus4_520251101Options>;

class BedrockClaudeOpus4_520251101 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus4_520251101OptionsType) {
    super(BedrockClaudeOpus4_520251101Schema, options);
  }
}

export {
  BedrockClaudeOpus4_520251101,
  BedrockClaudeOpus4_520251101Literal,
  BedrockClaudeOpus4_520251101Options,
  BedrockClaudeOpus4_520251101Schema,
  type BedrockClaudeOpus4_520251101OptionsType,
};
