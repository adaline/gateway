import {
  AdaptiveThinkingConfigOptions,
  ChatModelAdaptiveThinkingConfigDef,
  ChatModelAdaptiveThinkingConfigSchema,
} from "./chat-model/adaptive-thinking.config.chat-model.anthropic";
import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model/base.config.chat-model.anthropic";
import {
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  ExtendedThinkingEffortOptions,
} from "./chat-model/extended-thinking.config.chat-model.anthropic";
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
  // Manual extended thinking: thinking: { type: "enabled", budget_tokens }.
  extendedThinking: (
    maxOutputTokens: number,
    maxSequences: number,
    minReasoningToken: number,
    maxReasoningTokens: number,
    effortOptions?: ExtendedThinkingEffortOptions
  ) => ({
    def: ChatModelReasoningConfigDef(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningTokens, effortOptions),
    schema: ChatModelReasoningConfigSchema(maxOutputTokens, maxSequences, minReasoningToken, maxReasoningTokens, effortOptions),
  }),
  // Adaptive thinking: thinking: { type: "adaptive" | "disabled" | "between_tools" } plus output_config.effort.
  adaptiveThinking: (options: AdaptiveThinkingConfigOptions) => ({
    def: ChatModelAdaptiveThinkingConfigDef(options),
    schema: ChatModelAdaptiveThinkingConfigSchema(options),
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
