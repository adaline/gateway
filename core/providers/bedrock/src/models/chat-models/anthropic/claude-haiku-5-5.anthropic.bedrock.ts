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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-5-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Effort defaults to 'medium'; 'disabled' is accepted only at 'high' effort or below. Prompts over 100,000 tokens pay higher rates.
// No in-region bare ID: use a us./ca./eu./au./jp./global. inference profile.
const BedrockClaudeHaiku5_5Literal = "anthropic.claude-haiku-5-5";
const BedrockClaudeHaiku5_5Description =
  "For high-volume, latency-sensitive tasks such as classification, extraction, and routing, with adaptive thinking and a 1M token context window.";

const BedrockClaudeHaiku5_5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "medium",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeHaiku5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeHaiku5_5Literal,
  description: BedrockClaudeHaiku5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeHaiku5_5Config.def,
    schema: BedrockClaudeHaiku5_5Config.schema,
  },
  price: pricingData[BedrockClaudeHaiku5_5Literal],
});

const BedrockClaudeHaiku5_5Options = BaseChatModelOptions;
type BedrockClaudeHaiku5_5OptionsType = z.infer<typeof BedrockClaudeHaiku5_5Options>;

class BedrockClaudeHaiku5_5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeHaiku5_5OptionsType) {
    super(BedrockClaudeHaiku5_5Schema, options);
  }
}

export {
  BedrockClaudeHaiku5_5,
  BedrockClaudeHaiku5_5Literal,
  BedrockClaudeHaiku5_5Options,
  BedrockClaudeHaiku5_5Schema,
  type BedrockClaudeHaiku5_5OptionsType,
};
