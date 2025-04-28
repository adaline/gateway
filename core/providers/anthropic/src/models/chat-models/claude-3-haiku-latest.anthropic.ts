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

const Claude3_5HaikuLatestLiteral = "claude-3-5-haiku-latest";
const Claude3_5HaikuLatestDescription = "Our fastest model with intelligence at blazing speeds.";

const Claude3_5HaikuLatestSchema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3_5HaikuLatestLiteral,
  description: Claude3_5HaikuLatestDescription,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
  },
  price: pricingData[Claude3_5HaikuLatestLiteral],
});

const Claude3_5HaikuLatestOptions = BaseChatModelOptions;
type Claude3_5HaikuLatestOptionsType = z.infer<typeof Claude3_5HaikuLatestOptions>;

class Claude3_5HaikuLatest extends BaseChatModel {
  constructor(options: Claude3_5HaikuLatestOptionsType) {
    super(Claude3_5HaikuLatestSchema, options);
  }
}

export {
  Claude3_5HaikuLatest,
  Claude3_5HaikuLatestLiteral,
  Claude3_5HaikuLatestOptions,
  Claude3_5HaikuLatestSchema,
  type Claude3_5HaikuLatestOptionsType,
};
