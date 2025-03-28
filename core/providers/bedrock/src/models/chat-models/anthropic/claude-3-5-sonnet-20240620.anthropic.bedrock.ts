import { z } from "zod";

import {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
} from "@adaline/anthropic";
import { ChatModelSchema } from "@adaline/provider";

import { BedrockAnthropicChatModelConfigs } from "../../../configs";
import { BaseChatModelOptions } from "../base-chat-model-options.bedrock";
import { BaseChatModelAnthropic } from "./base-chat-model.anthropic.bedrock";

const BedrockClaude3_5Sonnet20240620Literal = "anthropic.claude-3-5-sonnet-20240620-v1:0";
const BedrockClaude3_5Sonnet20240620Description = "Most intelligent model. Highest level of intelligence and capability.";

const BedrockClaude3_5Sonnet20240620Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3_5Sonnet20240620Literal,
  description: BedrockClaude3_5Sonnet20240620Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(8192, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(8192, 4).schema,
  },
});

const BedrockClaude3_5Sonnet20240620Options = BaseChatModelOptions;
type BedrockClaude3_5Sonnet20240620OptionsType = z.infer<typeof BedrockClaude3_5Sonnet20240620Options>;

class BedrockClaude3_5Sonnet20240620 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3_5Sonnet20240620OptionsType) {
    super(BedrockClaude3_5Sonnet20240620Schema, options);
  }
}

export {
  BedrockClaude3_5Sonnet20240620,
  BedrockClaude3_5Sonnet20240620Literal,
  BedrockClaude3_5Sonnet20240620Options,
  BedrockClaude3_5Sonnet20240620Schema,
  type BedrockClaude3_5Sonnet20240620OptionsType,
};
