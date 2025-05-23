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

const Claude4Sonnet20250514Literal = "claude-4-sonnet-20250514";
const Claude4Sonnet20250514Description = "Our most capable and intelligent model yet. Training cutoff: March 2025.";

const Claude4Sonnet20250514Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: Claude4Sonnet20250514Literal,
  description: Claude4Sonnet20250514Description,
  maxInputTokens: 200000,
  maxOutputTokens: 64000,
  maxReasoningTokens: 64000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(64000, 4, 1024, 64000).schema,
  },
  price: pricingData[Claude4Sonnet20250514Literal],
});

const Claude4Sonnet20250514Options = BaseChatModelOptions;
type Claude4Sonnet20250514OptionsType = z.infer<typeof Claude4Sonnet20250514Options>;

class Claude4Sonnet20250514 extends BaseChatModel {
  constructor(options: Claude4Sonnet20250514OptionsType) {
    super(Claude4Sonnet20250514Schema, options);
  }
}

export {
  Claude4Sonnet20250514,
  Claude4Sonnet20250514Literal,
  Claude4Sonnet20250514Options,
  Claude4Sonnet20250514Schema,
  type Claude4Sonnet20250514OptionsType,
};
