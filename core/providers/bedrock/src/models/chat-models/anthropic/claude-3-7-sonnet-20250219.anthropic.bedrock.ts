import { z } from "zod";

import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "@adaline/anthropic";
import { ChatModelSchema, HeadersType } from "@adaline/provider";

import { BedrockAnthropicChatModelConfigs } from "../../../configs";
import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import pricingData from "./../../pricing.json";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

const BedrockClaude3_7Sonnet20250219Literal = "anthropic.claude-3-7-sonnet-20250219-v1:0";
const BedrockClaude3_7Sonnet20250219Description = "Most intelligent model. Highest level of intelligence and capability.";

const BedrockClaude3_7Sonnet20250219Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3_7Sonnet20250219Literal,
  description: BedrockClaude3_7Sonnet20250219Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(128000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(128000, 4).schema,
  },
  price: pricingData[BedrockClaude3_7Sonnet20250219Literal],
});

const BedrockClaude3_7Sonnet20250219Options = BaseChatModelOptions;
type BedrockClaude3_7Sonnet20250219OptionsType = z.infer<typeof BedrockClaude3_7Sonnet20250219Options>;

class BedrockClaude3_7Sonnet20250219 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3_7Sonnet20250219OptionsType) {
    super(BedrockClaude3_7Sonnet20250219Schema, options);
  }

  getDefaultHeaders(): HeadersType {
    let headers = super.getDefaultHeaders();
    headers = {
      ...headers,
      "anthropic-beta": "output-128k-2025-02-19",
    };
    return headers;
  }
}

export {
  BedrockClaude3_7Sonnet20250219,
  BedrockClaude3_7Sonnet20250219Literal,
  BedrockClaude3_7Sonnet20250219Options,
  BedrockClaude3_7Sonnet20250219Schema,
  type BedrockClaude3_7Sonnet20250219OptionsType,
};
