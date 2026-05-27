import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model/base.config.chat-model.anthropic";
import { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema } from "./chat-model/extended-thinking.config.chat-model.anthropic";
import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model/base.config.embedding-model.anthropic";
import {
  EmbeddingModelFlexibleConfigDef,
  EmbeddingModelFlexibleConfigSchema,
} from "./embedding-model/flexible.config.embedding-model.anthropic";

const AnthropicChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
  extendedThinking: (maxOutputTokens: number, maxSequences: number, minReasoningToken: number, maxReasoningTokens: number) => ({
    def: ChatModelReasoningConfigDef(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningTokens),
    schema: ChatModelReasoningConfigSchema(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningTokens),
  }),
} as const;

const AnthropicEmbeddingModelConfigs = {
  base: () => ({
    def: EmbeddingModelBaseConfigDef(),
    schema: EmbeddingModelBaseConfigSchema(),
  }),
  // Adds output_dimension + output_dtype for the flexible-dimension Voyage models.
  flexible: () => ({
    def: EmbeddingModelFlexibleConfigDef(),
    schema: EmbeddingModelFlexibleConfigSchema(),
  }),
} as const;

export { AnthropicChatModelConfigs, AnthropicEmbeddingModelConfigs };
