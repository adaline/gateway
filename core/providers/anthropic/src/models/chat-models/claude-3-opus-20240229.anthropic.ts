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

const Claude3Opus20240229Literal = "claude-3-opus-20240229";
const Claude3Opus20240229Description =
  "Powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding.";

const Claude3Opus20240229Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: Claude3Opus20240229Literal,
  description: Claude3Opus20240229Description,
  maxInputTokens: 200000,
  maxOutputTokens: 4096,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(4096, 4).def,
    schema: AnthropicChatModelConfigs.base(4096, 4).schema,
  },
});

const Claude3Opus20240229Options = BaseChatModelOptions;
type Claude3Opus20240229OptionsType = z.infer<typeof Claude3Opus20240229Options>;

class Claude3Opus20240229 extends BaseChatModel {
  constructor(options: Claude3Opus20240229OptionsType) {
    super(Claude3Opus20240229Schema, options);
  }
}

export {
  Claude3Opus20240229,
  Claude3Opus20240229Options,
  Claude3Opus20240229Schema,
  Claude3Opus20240229Literal,
  type Claude3Opus20240229OptionsType,
};
