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

const Claude3Haiku20240307Literal = "claude-3-haiku-20240307";
const Claude3Haiku20240307Description =
  "Fastest and most compact model for near-instant responsiveness. Quick and accurate targeted performance.";

const Claude3Haiku20240307Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3Haiku20240307Literal,
  description: Claude3Haiku20240307Description,
  maxInputTokens: 200000,
  maxOutputTokens: 4096,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(4096, 4).def,
    schema: AnthropicChatModelConfigs.base(4096, 4).schema,
  },
});

const Claude3Haiku20240307Options = BaseChatModelOptions;
type Claude3Haiku20240307OptionsType = z.infer<typeof Claude3Haiku20240307Options>;

class Claude3Haiku20240307 extends BaseChatModel {
  constructor(options: Claude3Haiku20240307OptionsType) {
    super(Claude3Haiku20240307Schema, options);
  }
}

export {
  Claude3Haiku20240307,
  Claude3Haiku20240307Options,
  Claude3Haiku20240307Schema,
  Claude3Haiku20240307Literal,
  type Claude3Haiku20240307OptionsType,
};
