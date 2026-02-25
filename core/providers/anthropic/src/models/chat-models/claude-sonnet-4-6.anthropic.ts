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

// Specs reference: https://docs.anthropic.com/en/docs/about-claude/models/overview (retrieved 2026-02-25)
const ClaudeSonnet4_6Literal = "claude-sonnet-4-6";
const ClaudeSonnet4_6Description =
  "Balanced model for agentic reasoning and coding with strong performance at low latency. Training cutoff: August 2025.";

const ClaudeSonnet4_6Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet4_6Literal,
  description: ClaudeSonnet4_6Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).schema,
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

