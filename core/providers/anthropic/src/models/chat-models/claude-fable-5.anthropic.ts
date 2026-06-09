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
const ClaudeFable5Literal = "claude-fable-5";
const ClaudeFable5Description =
  "Anthropic's most capable model for the hardest agentic, coding, and reasoning tasks, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens.";

const ClaudeFable5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeFable5Literal,
  description: ClaudeFable5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
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
