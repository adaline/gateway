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
// Thinking is off unless requested. Rejects budget_tokens and non-default temperature / top_p / top_k with a 400 error.
const ClaudeOpus4_7Literal = "claude-opus-4-7";
const ClaudeOpus4_7Description =
  "Intelligent model for building agents and coding, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: January 2026.";

const ClaudeOpus4_7Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const ClaudeOpus4_7Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_7Literal,
  description: ClaudeOpus4_7Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeOpus4_7Config.def,
    schema: ClaudeOpus4_7Config.schema,
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
