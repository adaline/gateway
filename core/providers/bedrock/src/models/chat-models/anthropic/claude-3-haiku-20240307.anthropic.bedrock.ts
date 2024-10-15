import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import {
  AnthropicChatModelConfigs,
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "@adaline/anthropic";

import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

const BedrockClaude3Haiku20240307Literal = "anthropic.claude-3-haiku-20240307-v1:0";
const BedrockClaude3Haiku20240307Description =
  "Claude 3 Haiku is a large-scale multimodal model trained by Anthropic. \
It is the successor to Claude 3 and is designed to be more powerful and capable than its predecessor.";

const BedrockClaude3Haiku20240307Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3Haiku20240307Literal,
  description: BedrockClaude3Haiku20240307Description,
  maxInputTokens: 128000, // TODO: get from parent model
  maxOutputTokens: 128000, // TODO: get from parent model
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(128000, 4).def,
    schema: AnthropicChatModelConfigs.base(128000, 4).schema,
  },
});

const BedrockClaude3Haiku20240307Options = BaseChatModelOptions;
type BedrockClaude3Haiku20240307OptionsType = z.infer<typeof BedrockClaude3Haiku20240307Options>;

class BedrockClaude3Haiku20240307 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3Haiku20240307OptionsType) {
    super(BedrockClaude3Haiku20240307Schema, options);
  }
}

export {
  BedrockClaude3Haiku20240307,
  BedrockClaude3Haiku20240307Literal,
  BedrockClaude3Haiku20240307Options,
  BedrockClaude3Haiku20240307Schema,
  type BedrockClaude3Haiku20240307OptionsType,
};
