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

const Claude4Opus20250514Literal = "claude-4-opus-20250514";
const Claude4Opus20250514Description = "Our high-performance model with exceptional reasoning and efficiency. Training cutoff: March 2025.";

const Claude4Opus20250514Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: Claude4Opus20250514Literal,
  description: Claude4Opus20250514Description,
  maxInputTokens: 200000,
  maxOutputTokens: 32000,
  maxReasoningTokens: 32000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.extendedThinking(32000, 4, 1024, 32000).def,
    schema: AnthropicChatModelConfigs.extendedThinking(32000, 4, 1024, 32000).schema,
  },
  price: pricingData[Claude4Opus20250514Literal],
});

const Claude4Opus20250514Options = BaseChatModelOptions;
type Claude4Opus20250514OptionsType = z.infer<typeof Claude4Opus20250514Options>;

class Claude4Opus20250514 extends BaseChatModel {
  constructor(options: Claude4Opus20250514OptionsType) {
    super(Claude4Opus20250514Schema, options);
  }
}

export {
  Claude4Opus20250514,
  Claude4Opus20250514Literal,
  Claude4Opus20250514Options,
  Claude4Opus20250514Schema,
  type Claude4Opus20250514OptionsType,
};
