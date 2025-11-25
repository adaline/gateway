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

const ClaudeOpus4_520251101Literal = "claude-opus-4-5-20251101";
const ClaudeOpus4_520251101Description = "Premium model combining maximum intelligence with practical performance. Ideal for complex specialized tasks, professional software engineering, and advanced agents. Training cutoff: August 2025.";

const ClaudeOpus4_520251101Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeOpus4_520251101Literal,
  description: ClaudeOpus4_520251101Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).schema,
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
