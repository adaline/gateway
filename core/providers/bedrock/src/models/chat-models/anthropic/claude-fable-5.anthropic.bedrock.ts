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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-fable-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Access requires the `aws_review` data retention mode (set through the AWS Data Retention API); requests fail without it.
// Adaptive thinking is always on. Dual-use cyber/bio content classifiers return HTTP 200 with stop_reason "refusal"
// rather than an error, so callers must treat refusal as a response path.
const BedrockClaudeFable5Literal = "anthropic.claude-fable-5";
const BedrockClaudeFable5Description =
  "Frontier model for the hardest agentic, coding, and reasoning tasks, with always-on adaptive thinking. Requires the aws_review data retention mode on AWS Bedrock.";

const BedrockClaudeFable5Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const BedrockClaudeFable5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeFable5Literal,
  description: BedrockClaudeFable5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeFable5Config.def,
    schema: BedrockClaudeFable5Config.schema,
  },
  price: pricingData[BedrockClaudeFable5Literal],
});

const BedrockClaudeFable5Options = BaseChatModelOptions;
type BedrockClaudeFable5OptionsType = z.infer<typeof BedrockClaudeFable5Options>;

class BedrockClaudeFable5 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeFable5OptionsType) {
    super(BedrockClaudeFable5Schema, options);
  }
}

export {
  BedrockClaudeFable5,
  BedrockClaudeFable5Literal,
  BedrockClaudeFable5Options,
  BedrockClaudeFable5Schema,
  type BedrockClaudeFable5OptionsType,
};
