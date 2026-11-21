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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Adaptive thinking is on by default; 'disabled' is accepted only at 'high' effort or below.
const BedrockClaudeOpus5Literal = "anthropic.claude-opus-5";
const BedrockClaudeOpus5Description =
  "Anthropic's Opus model for coding, agents, and deeper reasoning in enterprise workflows, with adaptive thinking on by default and a 1M token context window.";

const BedrockClaudeOpus5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeOpus5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus5Literal,
  description: BedrockClaudeOpus5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus5Config.def,
    schema: BedrockClaudeOpus5Config.schema,
  },
  price: pricingData[BedrockClaudeOpus5Literal],
});

const BedrockClaudeOpus5Options = BaseChatModelOptions;
type BedrockClaudeOpus5OptionsType = z.infer<typeof BedrockClaudeOpus5Options>;

class BedrockClaudeOpus5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus5OptionsType) {
    super(BedrockClaudeOpus5Schema, options);
  }
}

export {
  BedrockClaudeOpus5,
  BedrockClaudeOpus5Literal,
  BedrockClaudeOpus5Options,
  BedrockClaudeOpus5Schema,
  type BedrockClaudeOpus5OptionsType,
};
