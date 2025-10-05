import { z } from "zod";

import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "@adaline/anthropic";
import { ChatModelSchema } from "@adaline/provider";

import { BedrockAnthropicChatModelConfigs } from "../../../configs";
import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import pricingData from "./../../pricing.json";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

const BedrockClaudeSonnet4_520250929Literal = "anthropic.claude-sonnet-4-5-20250929-v1:0";
const BedrockClaudeSonnet4_520250929Description = "Our best model for complex agents and coding, with the highest intelligence across most tasks. Training cutoff: July 2025.";

const BedrockClaudeSonnet4_520250929Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaudeSonnet4_520250929Literal,
  description: BedrockClaudeSonnet4_520250929Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(64000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(64000, 4).schema,
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
