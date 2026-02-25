import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import { AnthropicChatModelModalities, AnthropicChatModelModalitiesEnum, AnthropicChatModelRoles, AnthropicChatModelRolesMap } from "./types";

// Specs reference: https://docs.anthropic.com/en/docs/about-claude/models/overview (retrieved 2026-02-25)
const ClaudeHaiku4_520251001Literal = "claude-haiku-4-5-20251001";
const ClaudeHaiku4_520251001Description = "Fast and efficient model for high-throughput chat, extraction, and routing workloads.";

const ClaudeHaiku4_520251001Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: ClaudeHaiku4_520251001Literal,
  description: ClaudeHaiku4_520251001Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
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

