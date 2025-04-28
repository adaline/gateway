import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "./types";

const Claude3_5SonnetLatestLiteral = "claude-3-5-sonnet-latest";
const Claude3_5SonnetLatestDescription = "Most intelligent model. Highest level of intelligence and capability.";

const Claude3_5SonnetLatestSchema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3_5SonnetLatestLiteral,
  description: Claude3_5SonnetLatestDescription,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
  },
  price: pricingData[Claude3_5SonnetLatestLiteral],
});

const Claude3_5SonnetLatestOptions = BaseChatModelOptions;
type Claude3_5SonnetLatestOptionsType = z.infer<typeof Claude3_5SonnetLatestOptions>;

class Claude3_5SonnetLatest extends BaseChatModel {
  constructor(options: Claude3_5SonnetLatestOptionsType) {
    super(Claude3_5SonnetLatestSchema, options);
  }
}

export {
  Claude3_5SonnetLatest,
  Claude3_5SonnetLatestLiteral,
  Claude3_5SonnetLatestOptions,
  Claude3_5SonnetLatestSchema,
  type Claude3_5SonnetLatestOptionsType,
};
