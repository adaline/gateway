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
const ClaudeSonnet4_6Literal = "claude-sonnet-4-6";
const ClaudeSonnet4_6Description =
  "Balanced model for agentic reasoning and coding with strong performance at low latency, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: August 2025.";

const ClaudeSonnet4_6Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "disabled",
  effortLevels: ["low", "medium", "high", "max"],
  defaultEffort: "high",
  samplingParams: true,
  forcedToolUse: true,
});

const ClaudeSonnet4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet4_6Literal,
  description: ClaudeSonnet4_6Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeSonnet4_6Config.def,
    schema: ClaudeSonnet4_6Config.schema,
  },
  price: pricingData[ClaudeSonnet4_6Literal],
});

const ClaudeSonnet4_6Options = BaseChatModelOptions;
type ClaudeSonnet4_6OptionsType = z.infer<typeof ClaudeSonnet4_6Options>;

class ClaudeSonnet4_6 extends BaseChatModel {
  constructor(options: ClaudeSonnet4_6OptionsType) {
    super(ClaudeSonnet4_6Schema, options);
  }
}

export { ClaudeSonnet4_6, ClaudeSonnet4_6Literal, ClaudeSonnet4_6Options, ClaudeSonnet4_6Schema, type ClaudeSonnet4_6OptionsType };
