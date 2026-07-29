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

// Specs reference: https://platform.claude.com/docs/en/about-claude/models/overview (retrieved 2026-07-29)
const ClaudeOpus5Literal = "claude-opus-5";
const ClaudeOpus5Description =
  "For complex agentic coding and enterprise work, with adaptive thinking on by default. Features a 1M token context window and 128K max output tokens. Training cutoff: May 2026.";

const ClaudeOpus5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus5Literal,
  description: ClaudeOpus5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
  },
  price: pricingData[ClaudeOpus5Literal],
});

const ClaudeOpus5Options = BaseChatModelOptions;
type ClaudeOpus5OptionsType = z.infer<typeof ClaudeOpus5Options>;

class ClaudeOpus5 extends BaseChatModel {
  constructor(options: ClaudeOpus5OptionsType) {
    super(ClaudeOpus5Schema, options);
  }
}

export { ClaudeOpus5, ClaudeOpus5Literal, ClaudeOpus5Options, ClaudeOpus5Schema, type ClaudeOpus5OptionsType };
