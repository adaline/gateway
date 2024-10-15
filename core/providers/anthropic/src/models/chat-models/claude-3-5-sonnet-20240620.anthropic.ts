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

const Claude3_5Sonnet20240620Literal = "claude-3-5-sonnet-20240620";
const Claude3_5Sonnet20240620Description = "Most intelligent model. Highest level of intelligence and capability.";

const Claude3_5Sonnet20240620Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3_5Sonnet20240620Literal,
  description: Claude3_5Sonnet20240620Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
  },
});

const Claude3_5Sonnet20240620Options = BaseChatModelOptions;
type Claude3_5Sonnet20240620OptionsType = z.infer<typeof Claude3_5Sonnet20240620Options>;

class Claude3_5Sonnet20240620 extends BaseChatModel {
  constructor(options: Claude3_5Sonnet20240620OptionsType) {
    super(Claude3_5Sonnet20240620Schema, options);
  }
}

export {
  Claude3_5Sonnet20240620,
  Claude3_5Sonnet20240620Options,
  Claude3_5Sonnet20240620Schema,
  Claude3_5Sonnet20240620Literal,
  type Claude3_5Sonnet20240620OptionsType,
};
