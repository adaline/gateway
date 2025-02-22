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

const BedrockClaude3Opus20240229Literal = "anthropic.claude-3-opus-20240229-v1:0";
const BedrockClaude3Opus20240229Description =
  "Powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding.";

const BedrockClaude3Opus20240229Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3Opus20240229Literal,
  description: BedrockClaude3Opus20240229Description,
  maxInputTokens: 200000,
  maxOutputTokens: 4096,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: AnthropicChatModelConfigs.base(4096, 4).def,
    schema: AnthropicChatModelConfigs.base(4096, 4).schema,
  },
});

const BedrockClaude3Opus20240229Options = BaseChatModelOptions;
type BedrockClaude3Opus20240229OptionsType = z.infer<typeof BedrockClaude3Opus20240229Options>;

class BedrockClaude3Opus20240229 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3Opus20240229OptionsType) {
    super(BedrockClaude3Opus20240229Schema, options);
  }
}

export {
  BedrockClaude3Opus20240229,
  BedrockClaude3Opus20240229Literal,
  BedrockClaude3Opus20240229Options,
  BedrockClaude3Opus20240229Schema,
  type BedrockClaude3Opus20240229OptionsType,
};
