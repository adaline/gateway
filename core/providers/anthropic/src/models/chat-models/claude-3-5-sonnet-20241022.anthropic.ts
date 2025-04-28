import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import pricingData from "./../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "./types";

const Claude3_5Sonnet20241022Literal = "claude-3-5-sonnet-20241022";
const Claude3_5Sonnet20241022Description = "Most intelligent model. Highest level of intelligence and capability.";

const Claude3_5Sonnet20241022Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3_5Sonnet20241022Literal,
  description: Claude3_5Sonnet20241022Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
  },
  price: pricingData[Claude3_5Sonnet20241022Literal],
});

const Claude3_5Sonnet20241022Options = BaseChatModelOptions;
type Claude3_5Sonnet20241022OptionsType = z.infer<typeof Claude3_5Sonnet20241022Options>;

class Claude3_5Sonnet20241022 extends BaseChatModel {
  constructor(options: Claude3_5Sonnet20241022OptionsType) {
    super(Claude3_5Sonnet20241022Schema, options);
  }
}

export {
  Claude3_5Sonnet20241022,
  Claude3_5Sonnet20241022Literal,
  Claude3_5Sonnet20241022Options,
  Claude3_5Sonnet20241022Schema,
  type Claude3_5Sonnet20241022OptionsType,
};
