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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Adaptive thinking is always on and effort defaults to 'medium'. Rejects forced tool use with a 400 error.
// The bare ID works in-region only in eu-west-2; elsewhere use a us./eu./au./jp./global. inference profile.
const BedrockClaudeOpus5_5Literal = "anthropic.claude-opus-5-5";
const BedrockClaudeOpus5_5Description =
  "For long-running agentic coding and knowledge work, with always-on adaptive thinking and a 1M token context window.";

const BedrockClaudeOpus5_5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "medium",
  samplingParams: false,
  forcedToolUse: false,
});

const BedrockClaudeOpus5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus5_5Literal,
  description: BedrockClaudeOpus5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeOpus5_5Config.def,
    schema: BedrockClaudeOpus5_5Config.schema,
  },
  price: pricingData[BedrockClaudeOpus5_5Literal],
});

const BedrockClaudeOpus5_5Options = BaseChatModelOptions;
type BedrockClaudeOpus5_5OptionsType = z.infer<typeof BedrockClaudeOpus5_5Options>;

class BedrockClaudeOpus5_5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus5_5OptionsType) {
    super(BedrockClaudeOpus5_5Schema, options);
  }
}

export {
  BedrockClaudeOpus5_5,
  BedrockClaudeOpus5_5Literal,
  BedrockClaudeOpus5_5Options,
  BedrockClaudeOpus5_5Schema,
  type BedrockClaudeOpus5_5OptionsType,
};
