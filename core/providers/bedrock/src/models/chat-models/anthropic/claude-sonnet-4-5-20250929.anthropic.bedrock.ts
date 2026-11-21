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

// Bedrock model card: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-5.html (retrieved 2026-11-20)
// Pricing: AWS Bedrock global on-demand rate from the AmazonBedrockFoundationModels offer file (retrieved 2026-11-20); regional endpoints cost 10% more.
// Legacy since 2026-10-08; EOL 2027-04-08 (GovCloud 2027-04-27). Extended-access pricing may apply from 2027-01-08.
const BedrockClaudeSonnet4_520250929Literal = "anthropic.claude-sonnet-4-5-20250929-v1:0";
const BedrockClaudeSonnet4_520250929Description =
  "Our best model for complex agents and coding, with the highest intelligence across most tasks. Training cutoff: July 2025. Legacy on AWS Bedrock; EOL 2027-04-08.";

const BedrockClaudeSonnet4_520250929Config = BedrockAnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000);

const BedrockClaudeSonnet4_520250929Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet4_520250929Literal,
  description: BedrockClaudeSonnet4_520250929Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: BedrockClaudeSonnet4_520250929Config.def,
    schema: BedrockClaudeSonnet4_520250929Config.schema,
  },
  price: pricingData[BedrockClaudeSonnet4_520250929Literal],
});

const BedrockClaudeSonnet4_520250929Options = BaseChatModelOptions;
type BedrockClaudeSonnet4_520250929OptionsType = z.infer<typeof BedrockClaudeSonnet4_520250929Options>;

class BedrockClaudeSonnet4_520250929 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeSonnet4_520250929OptionsType) {
    super(BedrockClaudeSonnet4_520250929Schema, options);
  }
}

export {
  BedrockClaudeSonnet4_520250929,
  BedrockClaudeSonnet4_520250929Literal,
  BedrockClaudeSonnet4_520250929Options,
  BedrockClaudeSonnet4_520250929Schema,
  type BedrockClaudeSonnet4_520250929OptionsType,
};
