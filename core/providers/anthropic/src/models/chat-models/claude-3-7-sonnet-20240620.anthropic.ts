import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "./types";

const Claude3_7Sonnet20250219Literal = "claude-3-7-sonnet-20250219";
const Claude3_7Sonnet20250219Description = "Most intelligent model. Highest level of intelligence and capability.";

const Claude3_7Sonnet20250219Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3_7Sonnet20250219Literal,
  description: Claude3_7Sonnet20250219Description,
  maxInputTokens: 200000,
  maxOutputTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(128000, 4).def,
    schema: AnthropicChatModelConfigs.base(128000, 4).schema,
  },
});

const Claude3_7Sonnet20250219Options = BaseChatModelOptions;
type Claude3_7Sonnet20250219OptionsType = z.infer<typeof Claude3_7Sonnet20250219Options>;

class Claude3_7Sonnet20250219 extends BaseChatModel {
  constructor(options: Claude3_7Sonnet20250219OptionsType) {
    super(Claude3_7Sonnet20250219Schema, options);
  }
}

export {
  Claude3_7Sonnet20250219,
  Claude3_7Sonnet20250219Literal,
  Claude3_7Sonnet20250219Options,
  Claude3_7Sonnet20250219Schema,
  type Claude3_7Sonnet20250219OptionsType,
};
