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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-fable-5-1.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Access requires the `aws_review` data retention mode (set through the AWS Data Retention API); requests fail without it.
// Adaptive thinking is always on. Dual-use cyber/bio content classifiers return HTTP 200 with stop_reason "refusal"
// rather than an error, so callers must treat refusal as a response path.
// Rejects forced tool use (tool_choice 'any' or a named tool). Served through the us. and global. inference profiles.
const BedrockClaudeFable5_1Literal = "anthropic.claude-fable-5-1";
const BedrockClaudeFable5_1Description =
  "Previous-generation Fable model for long-horizon agentic and coding work, with always-on adaptive thinking. Requires the aws_review data retention mode on AWS Bedrock.";

const BedrockClaudeFable5_1Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const BedrockClaudeFable5_1Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeFable5_1Literal,
  description: BedrockClaudeFable5_1Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeFable5_1Config.def,
    schema: BedrockClaudeFable5_1Config.schema,
  },
  price: pricingData[BedrockClaudeFable5_1Literal],
});

const BedrockClaudeFable5_1Options = BaseChatModelOptions;
type BedrockClaudeFable5_1OptionsType = z.infer<typeof BedrockClaudeFable5_1Options>;

class BedrockClaudeFable5_1 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeFable5_1OptionsType) {
    super(BedrockClaudeFable5_1Schema, options);
  }
}

export {
  BedrockClaudeFable5_1,
  BedrockClaudeFable5_1Literal,
  BedrockClaudeFable5_1Options,
  BedrockClaudeFable5_1Schema,
  type BedrockClaudeFable5_1OptionsType,
};
