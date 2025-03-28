import {
  BedrockAnthropicChatModelBaseConfigDef,
  BedrockAnthropicChatModelBaseConfigSchema,
} from "./chat-model/anthropic/base.config.chat-model.bedrock";

const BedrockAnthropicChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: BedrockAnthropicChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: BedrockAnthropicChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
} as const;

export { BedrockAnthropicChatModelConfigs };
