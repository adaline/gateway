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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-fable-5.html (retrieved 2026-07-29)
// Pricing verified: https://aws.amazon.com/bedrock/pricing/ (retrieved 2026-07-29)
// Access requires opting in to provider data sharing — set the data retention mode to `provider_data_share` via the AWS Data Retention
// API; there is no console UI for this and requests fail without it.
// Adaptive thinking is always on and cannot be disabled. Dual-use cyber/bio content classifiers return HTTP 200 with
// stop_reason "refusal" (plus a stop_details restriction category) rather than an error, so callers must treat refusal as a response path.
const BedrockClaudeFable5Literal = "anthropic.claude-fable-5";
const BedrockClaudeFable5Description =
  "Anthropic's most capable model for the hardest agentic, coding, and reasoning tasks, with always-on adaptive thinking. Requires the provider data sharing opt-in on AWS Bedrock.";

const BedrockClaudeFable5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeFable5Literal,
  description: BedrockClaudeFable5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(128000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(128000, 4).schema,
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
