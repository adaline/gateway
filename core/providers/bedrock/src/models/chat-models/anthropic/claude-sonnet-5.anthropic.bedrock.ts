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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// $2/$10 launch pricing became the standard price; the scheduled 2026-09-01 increase to $3/$15 did not happen.
const BedrockClaudeSonnet5Literal = "anthropic.claude-sonnet-5";
const BedrockClaudeSonnet5Description =
  "Anthropic's Sonnet model built for coding, agents, and professional work at scale, with adaptive thinking on by default and a 1M token context window.";

const BedrockClaudeSonnet5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeSonnet5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet5Literal,
  description: BedrockClaudeSonnet5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeSonnet5Config.def,
    schema: BedrockClaudeSonnet5Config.schema,
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
