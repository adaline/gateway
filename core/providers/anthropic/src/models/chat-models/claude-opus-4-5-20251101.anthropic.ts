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
// The only extended-thinking model that also accepts the effort parameter, which composes with budget_tokens.
const ClaudeOpus4_520251101Literal = "claude-opus-4-5-20251101";
const ClaudeOpus4_520251101Description =
  "Premium model combining maximum intelligence with practical performance. Ideal for complex specialized tasks, professional software engineering, and advanced agents. Features a 200K token context window and 64K max output tokens. Training cutoff: August 2025.";

const ClaudeOpus4_520251101Config = AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000, {
  levels: ["low", "medium", "high"],
  default: "high",
});

const ClaudeOpus4_520251101Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_520251101Literal,
  description: ClaudeOpus4_520251101Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeOpus4_520251101Config.def,
    schema: ClaudeOpus4_520251101Config.schema,
  },
  price: pricingData[ClaudeOpus4_520251101Literal],
});

const ClaudeOpus4_520251101Options = BaseChatModelOptions;
type ClaudeOpus4_520251101OptionsType = z.infer<typeof ClaudeOpus4_520251101Options>;

class ClaudeOpus4_520251101 extends BaseChatModel {
  constructor(options: ClaudeOpus4_520251101OptionsType) {
    super(ClaudeOpus4_520251101Schema, options);
  }
}

export {
  ClaudeOpus4_520251101,
  ClaudeOpus4_520251101Literal,
  ClaudeOpus4_520251101Options,
  ClaudeOpus4_520251101Schema,
  type ClaudeOpus4_520251101OptionsType,
};
