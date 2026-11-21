import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { VertexEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.vertex";
import { VertexEmbeddingModelModalities, VertexEmbeddingModelModalitiesEnum } from "./types";

const Text_Multilingual_Embedding_002Literal = "text-multilingual-embedding-002";
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions (retrieved 2026-11-20)
const Text_Multilingual_Embedding_002_Description =
  "Vertex AI text-multilingual-embedding-002 — multilingual general-purpose text embedding covering 100+ languages, " +
  "default 768 dims, configurable via `outputDimensionality`. Max input 2048 tokens. " +
  "Scheduled retirement 2027-04-01 (replacement: gemini-embedding-001 / gemini-embedding-2).";

const Text_Multilingual_Embedding_002Schema = EmbeddingModelSchema(VertexEmbeddingModelModalitiesEnum).parse({
  name: Text_Multilingual_Embedding_002Literal,
  description: Text_Multilingual_Embedding_002_Description,
  modalities: VertexEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: VertexEmbeddingModelConfigs.base(768).def,
    schema: VertexEmbeddingModelConfigs.base(768).schema,
  },
  price: embeddingPricingData[Text_Multilingual_Embedding_002Literal],
});

const Text_Multilingual_Embedding_002Options = BaseEmbeddingModelOptions;
type Text_Multilingual_Embedding_002OptionsType = z.infer<typeof Text_Multilingual_Embedding_002Options>;

class Text_Multilingual_Embedding_002 extends BaseEmbeddingModel {
  constructor(options: Text_Multilingual_Embedding_002OptionsType) {
    super(Text_Multilingual_Embedding_002Schema, options);
  }
}

export {
  Text_Multilingual_Embedding_002,
  Text_Multilingual_Embedding_002Options,
  Text_Multilingual_Embedding_002Schema,
  Text_Multilingual_Embedding_002Literal,
  type Text_Multilingual_Embedding_002OptionsType,
};
