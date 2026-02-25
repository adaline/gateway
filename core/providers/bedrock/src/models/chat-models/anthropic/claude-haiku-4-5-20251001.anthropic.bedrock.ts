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

// Bedrock model ID reference: https://docs.anthropic.com/en/docs/about-claude/models/overview (retrieved 2026-02-25)
const BedrockClaudeHaiku4_520251001Literal = "anthropic.claude-haiku-4-5-20251001-v1:0";
const BedrockClaudeHaiku4_520251001Description = "Fast and efficient model for high-throughput chat, extraction, and routing workloads.";

const BedrockClaudeHaiku4_520251001Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaudeHaiku4_520251001Literal,
  description: BedrockClaudeHaiku4_520251001Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(8192, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(8192, 4).schema,
  },
  price: pricingData[BedrockClaudeHaiku4_520251001Literal],
});

const BedrockClaudeHaiku4_520251001Options = BaseChatModelOptions;
type BedrockClaudeHaiku4_520251001OptionsType = z.infer<typeof BedrockClaudeHaiku4_520251001Options>;

class BedrockClaudeHaiku4_520251001 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaudeHaiku4_520251001OptionsType) {
    super(BedrockClaudeHaiku4_520251001Schema, options);
  }
}

export {
  BedrockClaudeHaiku4_520251001,
  BedrockClaudeHaiku4_520251001Literal,
  BedrockClaudeHaiku4_520251001Options,
  BedrockClaudeHaiku4_520251001Schema,
  type BedrockClaudeHaiku4_520251001OptionsType,
};

