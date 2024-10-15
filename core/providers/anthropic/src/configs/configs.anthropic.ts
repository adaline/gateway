import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model/base.config.chat-model.anthropic";
import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model/base.config.embedding-model.anthropic";

const AnthropicChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
} as const;

const AnthropicEmbeddingModelConfigs = {
  base: () => ({
    def: EmbeddingModelBaseConfigDef(),
    schema: EmbeddingModelBaseConfigSchema(),
  }),
} as const;

export { AnthropicChatModelConfigs, AnthropicEmbeddingModelConfigs };
