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

const BedrockClaude4Sonnet20250514Literal = "anthropic.claude-sonnet-4-20250514-v1:0";
const BedrockClaude4Sonnet20250514Description = "Our most capable and intelligent model yet. Training cutoff: March 2025.";

const BedrockClaude4Sonnet20250514Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude4Sonnet20250514Literal,
  description: BedrockClaude4Sonnet20250514Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(64000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(64000, 4).schema,
  },
  price: pricingData[BedrockClaude4Sonnet20250514Literal],
});

const BedrockClaude4Sonnet20250514Options = BaseChatModelOptions;
type BedrockClaude4Sonnet20250514OptionsType = z.infer<typeof BedrockClaude4Sonnet20250514Options>;

class BedrockClaude4Sonnet20250514 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude4Sonnet20250514OptionsType) {
    super(BedrockClaude4Sonnet20250514Schema, options);
  }
}

export {
  BedrockClaude4Sonnet20250514,
  BedrockClaude4Sonnet20250514Literal,
  BedrockClaude4Sonnet20250514Options,
  BedrockClaude4Sonnet20250514Schema,
  type BedrockClaude4Sonnet20250514OptionsType,
};
