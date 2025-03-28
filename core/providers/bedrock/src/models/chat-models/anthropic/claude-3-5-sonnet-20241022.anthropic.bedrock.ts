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

const BedrockClaude3_5Sonnet20241022Literal = "anthropic.claude-3-5-sonnet-20241022-v2:0";
const BedrockClaude3_5Sonnet20241022Description = "Most intelligent model. Highest level of intelligence and capability.";

const BedrockClaude3_5Sonnet20241022Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicChatModelModalitiesEnum).parse({
  name: BedrockClaude3_5Sonnet20241022Literal,
  description: BedrockClaude3_5Sonnet20241022Description,
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicChatModelModalities,
  config: {
    def: BedrockAnthropicChatModelConfigs.base(8192, 4).def,
    schema: BedrockAnthropicChatModelConfigs.base(8192, 4).schema,
  },
});

const BedrockClaude3_5Sonnet20241022Options = BaseChatModelOptions;
type BedrockClaude3_5Sonnet20241022OptionsType = z.infer<typeof BedrockClaude3_5Sonnet20241022Options>;

class BedrockClaude3_5Sonnet20241022 extends BaseChatModelAnthropic {
  constructor(options: BedrockClaude3_5Sonnet20241022OptionsType) {
    super(BedrockClaude3_5Sonnet20241022Schema, options);
  }
}

export {
  BedrockClaude3_5Sonnet20241022,
  BedrockClaude3_5Sonnet20241022Literal,
  BedrockClaude3_5Sonnet20241022Options,
  BedrockClaude3_5Sonnet20241022Schema,
  type BedrockClaude3_5Sonnet20241022OptionsType,
};
