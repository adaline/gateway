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
// Adaptive thinking is always on and effort defaults to 'medium'. Rejects forced tool use with a 400 error.
const ClaudeOpus5_5Literal = "claude-opus-5-5";
const ClaudeOpus5_5Description =
  "For long-running agentic coding and knowledge work, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: June 2026.";

const ClaudeOpus5_5Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "medium",
  samplingParams: false,
  forcedToolUse: false,
});

const ClaudeOpus5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus5_5Literal,
  description: ClaudeOpus5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeOpus5_5Config.def,
    schema: ClaudeOpus5_5Config.schema,
  },
  price: pricingData[ClaudeOpus5_5Literal],
});

const ClaudeOpus5_5Options = BaseChatModelOptions;
type ClaudeOpus5_5OptionsType = z.infer<typeof ClaudeOpus5_5Options>;

class ClaudeOpus5_5 extends BaseChatModel {
  constructor(options: ClaudeOpus5_5OptionsType) {
    super(ClaudeOpus5_5Schema, options);
  }
}

export { ClaudeOpus5_5, ClaudeOpus5_5Literal, ClaudeOpus5_5Options, ClaudeOpus5_5Schema, type ClaudeOpus5_5OptionsType };
