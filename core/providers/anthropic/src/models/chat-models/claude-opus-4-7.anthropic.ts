import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import {
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
  AnthropicThinkingChatModelModalities,
  AnthropicThinkingChatModelModalitiesEnum,
} from "./types";

const ClaudeOpus4_7Literal = "claude-opus-4-7";
const ClaudeOpus4_7Description =
  "Most intelligent model for building agents and coding. Features 128K max output tokens and 200K context window. Training cutoff: January 2026.";

const ClaudeOpus4_7Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_7Literal,
  description: ClaudeOpus4_7Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
  },
  price: pricingData[ClaudeOpus4_7Literal],
});

const ClaudeOpus4_7Options = BaseChatModelOptions;
type ClaudeOpus4_7OptionsType = z.infer<typeof ClaudeOpus4_7Options>;

class ClaudeOpus4_7 extends BaseChatModel {
  constructor(options: ClaudeOpus4_7OptionsType) {
    super(ClaudeOpus4_7Schema, options);
  }
}

export { ClaudeOpus4_7, ClaudeOpus4_7Literal, ClaudeOpus4_7Options, ClaudeOpus4_7Schema, type ClaudeOpus4_7OptionsType };
