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

// Specs reference: https://platform.claude.com/docs/en/about-claude/models/overview (retrieved 2026-06-09)
const ClaudeOpus4_8Literal = "claude-opus-4-8";
const ClaudeOpus4_8Description =
  "Most intelligent model for building agents and coding, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: January 2026.";

const ClaudeOpus4_8Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_8Literal,
  description: ClaudeOpus4_8Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
  },
  price: pricingData[ClaudeOpus4_8Literal],
});

const ClaudeOpus4_8Options = BaseChatModelOptions;
type ClaudeOpus4_8OptionsType = z.infer<typeof ClaudeOpus4_8Options>;

class ClaudeOpus4_8 extends BaseChatModel {
  constructor(options: ClaudeOpus4_8OptionsType) {
    super(ClaudeOpus4_8Schema, options);
  }
}

export { ClaudeOpus4_8, ClaudeOpus4_8Literal, ClaudeOpus4_8Options, ClaudeOpus4_8Schema, type ClaudeOpus4_8OptionsType };
