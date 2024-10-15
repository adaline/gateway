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

const Claude3Sonnet20240229Literal = "claude-3-sonnet-20240229";
const Claude3Sonnet20240229Description = "Balance of intelligence and speed. Strong utility, balanced for scaled deployments.";

const Claude3Sonnet20240229Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3Sonnet20240229Literal,
  description: Claude3Sonnet20240229Description,
  maxInputTokens: 200000,
  maxOutputTokens: 4096,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(4096, 4).def,
    schema: AnthropicChatModelConfigs.base(4096, 4).schema,
  },
});

const Claude3Sonnet20240229Options = BaseChatModelOptions;
type Claude3Sonnet20240229OptionsType = z.infer<typeof Claude3Sonnet20240229Options>;

class Claude3Sonnet20240229 extends BaseChatModel {
  constructor(options: Claude3Sonnet20240229OptionsType) {
    super(Claude3Sonnet20240229Schema, options);
  }
}

export {
  Claude3Sonnet20240229,
  Claude3Sonnet20240229Options,
  Claude3Sonnet20240229Schema,
  Claude3Sonnet20240229Literal,
  type Claude3Sonnet20240229OptionsType,
};
