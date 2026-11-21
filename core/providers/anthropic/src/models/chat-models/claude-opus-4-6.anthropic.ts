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

// Specs reference: https://platform.claude.com/docs/en/about-claude/models/overview and https://platform.claude.com/docs/en/build-with-claude/thinking (retrieved 2026-11-20)
// Thinking is off unless requested. Extended thinking (budget_tokens) is deprecated on this model, so adaptive thinking is used.
const ClaudeOpus4_6Literal = "claude-opus-4-6";
const ClaudeOpus4_6Description =
  "Intelligent model for building agents and coding, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: August 2025.";

const ClaudeOpus4_6Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "max"],
  defaultEffort: "high",
  samplingParams: true,
  forcedToolUse: true,
});

const ClaudeOpus4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_6Literal,
  description: ClaudeOpus4_6Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeOpus4_6Config.def,
    schema: ClaudeOpus4_6Config.schema,
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
