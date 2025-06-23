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

const BedrockClaude4Opus20250514Literal = "anthropic.claude-4-opus-20250514-v1:0";
const BedrockClaude4Opus20250514Description =
  "Our high-performance model with exceptional reasoning and efficiency. Training cutoff: March 2025.";

const BedrockClaude4Opus20250514Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude4Opus20250514Literal,
  description: BedrockClaude4Opus20250514Description,
  maxInputTokens: 200000,
  maxOutputTokens: 32000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(32000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(32000, 4).schema,
  },
  price: pricingData[BedrockClaude4Opus20250514Literal],
});

const BedrockClaude4Opus20250514Options = BaseChatModelOptions;
type BedrockClaude4Opus20250514OptionsType = z.infer<typeof BedrockClaude4Opus20250514Options>;

class BedrockClaude4Opus20250514 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude4Opus20250514OptionsType) {
    super(BedrockClaude4Opus20250514Schema, options);
  }
}

export {
  BedrockClaude4Opus20250514,
  BedrockClaude4Opus20250514Literal,
  BedrockClaude4Opus20250514Options,
  BedrockClaude4Opus20250514Schema,
  type BedrockClaude4Opus20250514OptionsType,
};
