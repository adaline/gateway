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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Rejects budget_tokens and non-default temperature / top_p / top_k with a 400 error.
const BedrockClaudeOpus4_8Literal = "anthropic.claude-opus-4-8";
const BedrockClaudeOpus4_8Description =
  "Anthropic Opus model optimized for coding, agents, and deeper reasoning in enterprise workflows, with adaptive thinking.";

const BedrockClaudeOpus4_8Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeOpus4_8Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_8Literal,
  description: BedrockClaudeOpus4_8Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus4_8Config.def,
    schema: BedrockClaudeOpus4_8Config.schema,
  },
  price: pricingData[BedrockClaudeOpus4_8Literal],
});

const BedrockClaudeOpus4_8Options = BaseChatModelOptions;
type BedrockClaudeOpus4_8OptionsType = z.infer<typeof BedrockClaudeOpus4_8Options>;

class BedrockClaudeOpus4_8 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus4_8OptionsType) {
    super(BedrockClaudeOpus4_8Schema, options);
  }
}

export {
  BedrockClaudeOpus4_8,
  BedrockClaudeOpus4_8Literal,
  BedrockClaudeOpus4_8Options,
  BedrockClaudeOpus4_8Schema,
  type BedrockClaudeOpus4_8OptionsType,
};
