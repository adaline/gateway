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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-fable-5-2.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Access requires the `aws_review` data retention mode (set through the AWS Data Retention API); requests fail without it.
// Adaptive thinking is always on. Dual-use cyber/bio content classifiers return HTTP 200 with stop_reason "refusal"
// rather than an error, so callers must treat refusal as a response path.
// Rejects forced tool use (tool_choice 'any' or a named tool). bedrock-runtime only, through the us. and global. inference profiles.
const BedrockClaudeFable5_2Literal = "anthropic.claude-fable-5-2";
const BedrockClaudeFable5_2Description =
  "For demanding reasoning and long-horizon agentic work, with always-on adaptive thinking. Requires the aws_review data retention mode on AWS Bedrock.";

const BedrockClaudeFable5_2Config = BedrockAnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const BedrockClaudeFable5_2Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeFable5_2Literal,
  description: BedrockClaudeFable5_2Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeFable5_2Config.def,
    schema: BedrockClaudeFable5_2Config.schema,
  },
  price: pricingData[BedrockClaudeFable5_2Literal],
});

const BedrockClaudeFable5_2Options = BaseChatModelOptions;
type BedrockClaudeFable5_2OptionsType = z.infer<typeof BedrockClaudeFable5_2Options>;

class BedrockClaudeFable5_2 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeFable5_2OptionsType) {
    super(BedrockClaudeFable5_2Schema, options);
  }
}

export {
  BedrockClaudeFable5_2,
  BedrockClaudeFable5_2Literal,
  BedrockClaudeFable5_2Options,
  BedrockClaudeFable5_2Schema,
  type BedrockClaudeFable5_2OptionsType,
};
