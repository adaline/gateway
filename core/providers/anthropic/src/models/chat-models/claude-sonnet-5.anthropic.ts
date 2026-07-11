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

// Specs reference: https://platform.claude.com/docs/en/about-claude/models/overview (retrieved 2026-07-10)
const ClaudeSonnet5Literal = "claude-sonnet-5";
const ClaudeSonnet5Description =
  "Anthropic's best combination of speed and intelligence — near-frontier Sonnet-tier model with adaptive thinking, a 1M token context window, and 128K max output tokens.";

const ClaudeSonnet5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet5Literal,
  description: ClaudeSonnet5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(128000, 4, 1024, 128000).schema,
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
