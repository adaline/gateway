import { z } from "zod";

import {
  AnthropicChatModelConfigs,
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "@adaline/anthropic";
import { ChatModelSchema } from "@adaline/provider";

import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

const BedrockClaude3_5Haiku20241022Literal = "anthropic.claude-3-5-haiku-20241022-v1:0";
const BedrockClaude3_5Haiku20241022Description = "Our fastest model with intelligence at blazing speeds.";

const BedrockClaude3_5Haiku20241022Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3_5Haiku20241022Literal,
  description: BedrockClaude3_5Haiku20241022Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(8192, 4).def,
    schema: AnthropicChatModelConfigs.base(8192, 4).schema,
  },
});

const BedrockClaude3_5Haiku20241022Options = BaseChatModelOptions;
type BedrockClaude3_5Haiku20241022OptionsType = z.infer<typeof BedrockClaude3_5Haiku20241022Options>;

class BedrockClaude3_5Haiku20241022 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3_5Haiku20241022OptionsType) {
    super(BedrockClaude3_5Haiku20241022Schema, options);
  }
}

export {
  BedrockClaude3_5Haiku20241022,
  BedrockClaude3_5Haiku20241022Literal,
  BedrockClaude3_5Haiku20241022Options,
  BedrockClaude3_5Haiku20241022Schema,
  type BedrockClaude3_5Haiku20241022OptionsType,
};
