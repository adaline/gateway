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
// Deprecated 2026-09-30, retires 2026-11-30 (https://platform.claude.com/docs/en/about-claude/model-deprecations).
const ClaudeSonnet4_520250929Literal = "claude-sonnet-4-5-20250929";
const ClaudeSonnet4_520250929Description =
  "Our best model for complex agents and coding, with the highest intelligence across most tasks. Features a 200K token context window and 64K max output tokens. Training cutoff: July 2025. Deprecated; retires 2026-11-30 (replacement: claude-sonnet-5-5).";

const ClaudeSonnet4_520250929Config = AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000);

const ClaudeSonnet4_520250929Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet4_520250929Literal,
  description: ClaudeSonnet4_520250929Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeSonnet4_520250929Config.def,
    schema: ClaudeSonnet4_520250929Config.schema,
  },
  price: pricingData[ClaudeSonnet4_520250929Literal],
});

const ClaudeSonnet4_520250929Options = BaseChatModelOptions;
type ClaudeSonnet4_520250929OptionsType = z.infer<typeof ClaudeSonnet4_520250929Options>;

class ClaudeSonnet4_520250929 extends BaseChatModel {
  constructor(options: ClaudeSonnet4_520250929OptionsType) {
    super(ClaudeSonnet4_520250929Schema, options);
  }
}

export {
  ClaudeSonnet4_520250929,
  ClaudeSonnet4_520250929Literal,
  ClaudeSonnet4_520250929Options,
  ClaudeSonnet4_520250929Schema,
  type ClaudeSonnet4_520250929OptionsType,
};
