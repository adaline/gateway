import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

// Specs reference: https://docs.voyageai.com/docs/embeddings and https://docs.voyageai.com/docs/pricing (retrieved 2026-11-20)
// The embeddings docs confirm only float output for voyage-code-4 (output_dimension / output_dtype support is unconfirmed),
// so this model uses the base config rather than the flexible one.
const VoyageCode4Literal = "voyage-code-4";
const VoyageCode4Description = "Optimized for code retrieval and coding agent use cases.";

const VoyageCode4Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageCode4Literal,
  description: VoyageCode4Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // default output dimension is 1024
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
  price: embeddingPricingData[VoyageCode4Literal],
});

const VoyageCode4Options = BaseEmbeddingModelOptions;
type VoyageCode4OptionsType = z.infer<typeof VoyageCode4Options>;

class VoyageCode4 extends BaseEmbeddingModel {
  constructor(options: VoyageCode4OptionsType) {
    super(VoyageCode4Schema, options);
  }
}

export { VoyageCode4, VoyageCode4Options, VoyageCode4Schema, VoyageCode4Literal, type VoyageCode4OptionsType };
