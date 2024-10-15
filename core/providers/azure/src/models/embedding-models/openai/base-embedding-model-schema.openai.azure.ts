import { EmbeddingModelSchema } from "@adaline/provider";

import { 
  OpenAIEmbeddingModelModalities, 
  OpenAIEmbeddingModelModalitiesEnum,
  OpenAIEmbeddingModelConfigs,
} from "@adaline/openai";

const BaseEmbeddingModelSchema = EmbeddingModelSchema(OpenAIEmbeddingModelModalitiesEnum).parse({
  name: "__base__",
  description: "Base embedding model for Azure OpenAI",
  maxInputTokens: 8192,
  maxOutputTokens: 3072,
  modalities: OpenAIEmbeddingModelModalities,
  config: {
    def: OpenAIEmbeddingModelConfigs.dimensions(3072).def,
    schema: OpenAIEmbeddingModelConfigs.dimensions(3072).schema,
  },
});

export { BaseEmbeddingModelSchema };