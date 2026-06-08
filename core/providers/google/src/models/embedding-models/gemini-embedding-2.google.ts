import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { GoogleEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.google";
import { GoogleEmbeddingModelModalities, GoogleEmbeddingModelModalitiesEnum } from "./types";

const Gemini_Embedding_2Literal = "gemini-embedding-2";
const Gemini_Embedding_2_Description =
  "Gemini Embedding 2 — Matryoshka representation learning with extended context. Default 3072 " +
  "dimensions; recommended sizes 768 / 1536 / 3072 via `outputDimensionality`. Max input 8192 " +
  "tokens (4× gemini-embedding-001). Successor to gemini-embedding-001 with multimodal support " +
  "available via the Gemini API (text-only path used here).";

const Gemini_Embedding_2Schema = EmbeddingModelSchema(GoogleEmbeddingModelModalitiesEnum).parse({
  name: Gemini_Embedding_2Literal,
  description: Gemini_Embedding_2_Description,
  modalities: GoogleEmbeddingModelModalities,
  maxInputTokens: 8192,
  maxOutputTokens: 3072,
  config: {
    def: GoogleEmbeddingModelConfigs.base(3072).def,
    schema: GoogleEmbeddingModelConfigs.base(3072).schema,
  },
  price: embeddingPricingData[Gemini_Embedding_2Literal],
});

const Gemini_Embedding_2Options = BaseEmbeddingModelOptions;
type Gemini_Embedding_2OptionsType = z.infer<typeof Gemini_Embedding_2Options>;

class Gemini_Embedding_2 extends BaseEmbeddingModel {
  constructor(options: Gemini_Embedding_2OptionsType) {
    super(Gemini_Embedding_2Schema, options);
  }
}

export {
  Gemini_Embedding_2,
  Gemini_Embedding_2Options,
  Gemini_Embedding_2Schema,
  Gemini_Embedding_2Literal,
  type Gemini_Embedding_2OptionsType,
};
