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

const ClaudeSonnet4_520250929Literal = "claude-sonnet-4-5-20250929";
const ClaudeSonnet4_520250929Description = "Our best model for complex agents and coding, with the highest intelligence across most tasks. Training cutoff: July 2025.";

const ClaudeSonnet4_520250929Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet4_520250929Literal,
  description: ClaudeSonnet4_520250929Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).schema,
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
