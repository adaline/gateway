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
// $2/$10 launch pricing became the standard price; the scheduled 2026-09-01 increase to $3/$15 did not happen.
const ClaudeSonnet5Literal = "claude-sonnet-5";
const ClaudeSonnet5Description =
  "Fast, intelligent Sonnet-tier model for coding and agents, with adaptive thinking on by default. Features a 1M token context window and 128K max output tokens.";

const ClaudeSonnet5Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "disabled"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: true,
});

const ClaudeSonnet5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet5Literal,
  description: ClaudeSonnet5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeSonnet5Config.def,
    schema: ClaudeSonnet5Config.schema,
  },
  price: pricingData[ClaudeSonnet5Literal],
});

const ClaudeSonnet5Options = BaseChatModelOptions;
type ClaudeSonnet5OptionsType = z.infer<typeof ClaudeSonnet5Options>;

class ClaudeSonnet5 extends BaseChatModel {
  constructor(options: ClaudeSonnet5OptionsType) {
    super(ClaudeSonnet5Schema, options);
  }
}

export { ClaudeSonnet5, ClaudeSonnet5Literal, ClaudeSonnet5Options, ClaudeSonnet5Schema, type ClaudeSonnet5OptionsType };
