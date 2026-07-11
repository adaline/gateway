import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { GoogleEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.google";
import { GoogleEmbeddingModelModalities, GoogleEmbeddingModelModalitiesEnum } from "./types";

const Gemini_Embedding_001Literal = "gemini-embedding-001";
const Gemini_Embedding_001_Description =
  "Gemini embedding model — Matryoshka representation learning. Default 3072 dimensions; " +
  "recommended sizes 768 / 1536 / 3072 via `outputDimensionality`. Max input 2048 tokens. " +
  "Deprecated by Google; scheduled shutdown 2026-07-14 (replacement: gemini-embedding-2).";

const Gemini_Embedding_001Schema = EmbeddingModelSchema(GoogleEmbeddingModelModalitiesEnum).parse({
  name: Gemini_Embedding_001Literal,
  description: Gemini_Embedding_001_Description,
  modalities: GoogleEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 3072,
  config: {
    def: GoogleEmbeddingModelConfigs.base(3072).def,
    schema: GoogleEmbeddingModelConfigs.base(3072).schema,
  },
  price: embeddingPricingData[Gemini_Embedding_001Literal],
});

const Gemini_Embedding_001Options = BaseEmbeddingModelOptions;
type Gemini_Embedding_001OptionsType = z.infer<typeof Gemini_Embedding_001Options>;

class Gemini_Embedding_001 extends BaseEmbeddingModel {
  constructor(options: Gemini_Embedding_001OptionsType) {
    super(Gemini_Embedding_001Schema, options);
  }
}

export {
  Gemini_Embedding_001,
  Gemini_Embedding_001Options,
  Gemini_Embedding_001Schema,
  Gemini_Embedding_001Literal,
  type Gemini_Embedding_001OptionsType,
};
