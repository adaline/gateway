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

const BedrockClaudeOpus4_520251101Literal = "anthropic.claude-opus-4-5-20251101-v1:0";
const BedrockClaudeOpus4_520251101Description = "Premium model combining maximum intelligence with practical performance. Ideal for complex specialized tasks, professional software engineering, and advanced agents. Training cutoff: August 2025.";

const BedrockClaudeOpus4_520251101Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaudeOpus4_520251101Literal,
  description: BedrockClaudeOpus4_520251101Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(64000, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(64000, 4).schema,
  },
  price: pricingData[BedrockClaudeOpus4_520251101Literal],
});

const BedrockClaudeOpus4_520251101Options = BaseChatModelOptions;
type BedrockClaudeOpus4_520251101OptionsType = z.infer<typeof BedrockClaudeOpus4_520251101Options>;

class BedrockClaudeOpus4_520251101 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeOpus4_520251101OptionsType) {
    super(BedrockClaudeOpus4_520251101Schema, options);
  }
}

export {
  BedrockClaudeOpus4_520251101,
  BedrockClaudeOpus4_520251101Literal,
  BedrockClaudeOpus4_520251101Options,
  BedrockClaudeOpus4_520251101Schema,
  type BedrockClaudeOpus4_520251101OptionsType,
};
