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
// Adaptive thinking is always on: 'disabled' and 'between_tools' return a 400 error.
const ClaudeFable5Literal = "claude-fable-5";
const ClaudeFable5Description =
  "Frontier model for the hardest agentic, coding, and reasoning tasks, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens.";

const ClaudeFable5Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const ClaudeFable5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeFable5Literal,
  description: ClaudeFable5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeFable5Config.def,
    schema: ClaudeFable5Config.schema,
  },
  price: pricingData[ClaudeFable5Literal],
});

const ClaudeFable5Options = BaseChatModelOptions;
type ClaudeFable5OptionsType = z.infer<typeof ClaudeFable5Options>;

class ClaudeFable5 extends BaseChatModel {
  constructor(options: ClaudeFable5OptionsType) {
    super(ClaudeFable5Schema, options);
  }
}

export { ClaudeFable5, ClaudeFable5Literal, ClaudeFable5Options, ClaudeFable5Schema, type ClaudeFable5OptionsType };
