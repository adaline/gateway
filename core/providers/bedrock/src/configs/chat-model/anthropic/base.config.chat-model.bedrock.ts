import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "@adaline/anthropic";

import { awsRegionChoice } from "../common.config.chat-model.bedrock";

const BedrockAnthropicChatModelBaseConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens, maxSequences).extend({
    awsRegion: awsRegionChoice.schema,
  });

const BedrockAnthropicChatModelBaseConfigDef = (maxOutputTokens: number, maxSequences: number) =>
  ({
    ...ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    awsRegion: awsRegionChoice.def,
  }) as const;

export { BedrockAnthropicChatModelBaseConfigDef, BedrockAnthropicChatModelBaseConfigSchema };
