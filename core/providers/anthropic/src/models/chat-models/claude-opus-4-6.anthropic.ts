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

const ClaudeOpus4_6Literal = "claude-opus-4-6";
const ClaudeOpus4_6Description =
  "Most intelligent model for building agents and coding. Features 128K max output tokens and 1M context window in beta. Training cutoff: August 2025.";

const ClaudeOpus4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_6Literal,
  description: ClaudeOpus4_6Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
  },
  price: pricingData[ClaudeOpus4_6Literal],
});

const ClaudeOpus4_6Options = BaseChatModelOptions;
type ClaudeOpus4_6OptionsType = z.infer<typeof ClaudeOpus4_6Options>;

class ClaudeOpus4_6 extends BaseChatModel {
  constructor(options: ClaudeOpus4_6OptionsType) {
    super(ClaudeOpus4_6Schema, options);
  }
}

export { ClaudeOpus4_6, ClaudeOpus4_6Literal, ClaudeOpus4_6Options, ClaudeOpus4_6Schema, type ClaudeOpus4_6OptionsType };
