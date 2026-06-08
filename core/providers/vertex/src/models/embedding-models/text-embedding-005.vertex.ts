import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { VertexEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.vertex";
import { VertexEmbeddingModelModalities, VertexEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_005Literal = "text-embedding-005";
const Text_Embedding_005_Description =
  "Vertex AI text-embedding-005 — English-only general-purpose text embedding, default 768 dims, " +
  "configurable via `outputDimensionality`. Drop-in successor to text-embedding-004.";

const Text_Embedding_005Schema = EmbeddingModelSchema(VertexEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_005Literal,
  description: Text_Embedding_005_Description,
  modalities: VertexEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: VertexEmbeddingModelConfigs.base(768).def,
    schema: VertexEmbeddingModelConfigs.base(768).schema,
  },
  price: embeddingPricingData[Text_Embedding_005Literal],
});

const Text_Embedding_005Options = BaseEmbeddingModelOptions;
type Text_Embedding_005OptionsType = z.infer<typeof Text_Embedding_005Options>;

class Text_Embedding_005 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_005OptionsType) {
    super(Text_Embedding_005Schema, options);
  }
}

export {
  Text_Embedding_005,
  Text_Embedding_005Options,
  Text_Embedding_005Schema,
  Text_Embedding_005Literal,
  type Text_Embedding_005OptionsType,
};
