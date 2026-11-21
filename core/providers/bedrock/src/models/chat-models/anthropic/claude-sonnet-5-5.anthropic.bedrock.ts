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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Rejects 'disabled'; 'between_tools' turns off up-front thinking at 'high' effort or below. Rejects forced tool use.
// No in-region bare ID: use a us./ca./eu./au./global. inference profile.
const BedrockClaudeSonnet5_5Literal = "anthropic.claude-sonnet-5-5";
const BedrockClaudeSonnet5_5Description =
  "The best combination of speed and intelligence, with adaptive thinking and a 1M token context window.";

const BedrockClaudeSonnet5_5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "between_tools"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const BedrockClaudeSonnet5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet5_5Literal,
  description: BedrockClaudeSonnet5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeSonnet5_5Config.def,
    schema: BedrockClaudeSonnet5_5Config.schema,
  },
  price: pricingData[BedrockClaudeSonnet5_5Literal],
});

const BedrockClaudeSonnet5_5Options = BaseChatModelOptions;
type BedrockClaudeSonnet5_5OptionsType = z.infer<typeof BedrockClaudeSonnet5_5Options>;

class BedrockClaudeSonnet5_5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeSonnet5_5OptionsType) {
    super(BedrockClaudeSonnet5_5Schema, options);
  }
}

export {
  BedrockClaudeSonnet5_5,
  BedrockClaudeSonnet5_5Literal,
  BedrockClaudeSonnet5_5Options,
  BedrockClaudeSonnet5_5Schema,
  type BedrockClaudeSonnet5_5OptionsType,
};
