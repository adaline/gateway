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
const ClaudeHaiku4_520251001Literal = "claude-haiku-4-5-20251001";
const ClaudeHaiku4_520251001Description =
  "Fast and efficient model for high-throughput chat, extraction, and routing workloads, with extended thinking. Features a 200K token context window and 64K max output tokens. Training cutoff: July 2025.";

const ClaudeHaiku4_520251001Config = AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000);

const ClaudeHaiku4_520251001Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeHaiku4_520251001Literal,
  description: ClaudeHaiku4_520251001Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeHaiku4_520251001Config.def,
    schema: ClaudeHaiku4_520251001Config.schema,
  },
  price: pricingData[ClaudeHaiku4_520251001Literal],
});

const ClaudeHaiku4_520251001Options = BaseChatModelOptions;
type ClaudeHaiku4_520251001OptionsType = z.infer<typeof ClaudeHaiku4_520251001Options>;

class ClaudeHaiku4_520251001 extends BaseChatModel {
  constructor(options: ClaudeHaiku4_520251001OptionsType) {
    super(ClaudeHaiku4_520251001Schema, options);
  }
}

export {
  ClaudeHaiku4_520251001,
  ClaudeHaiku4_520251001Literal,
  ClaudeHaiku4_520251001Options,
  ClaudeHaiku4_520251001Schema,
  type ClaudeHaiku4_520251001OptionsType,
};
