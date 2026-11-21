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
// Effort defaults to 'medium'; 'disabled' is accepted only at 'high' effort or below.
// Priced by prompt length: prompts over 100,000 tokens pay higher rates.
const ClaudeHaiku5_5Literal = "claude-haiku-5-5";
const ClaudeHaiku5_5Description =
  "For high-volume, latency-sensitive tasks such as classification, extraction, and routing, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: June 2026.";

const ClaudeHaiku5_5Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "medium",
  samplingParams: false,
  forcedToolUse: true,
});

const ClaudeHaiku5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeHaiku5_5Literal,
  description: ClaudeHaiku5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeHaiku5_5Config.def,
    schema: ClaudeHaiku5_5Config.schema,
  },
  price: pricingData[ClaudeHaiku5_5Literal],
});

const ClaudeHaiku5_5Options = BaseChatModelOptions;
type ClaudeHaiku5_5OptionsType = z.infer<typeof ClaudeHaiku5_5Options>;

class ClaudeHaiku5_5 extends BaseChatModel {
  constructor(options: ClaudeHaiku5_5OptionsType) {
    super(ClaudeHaiku5_5Schema, options);
  }
}

export { ClaudeHaiku5_5, ClaudeHaiku5_5Literal, ClaudeHaiku5_5Options, ClaudeHaiku5_5Schema, type ClaudeHaiku5_5OptionsType };
