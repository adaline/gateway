import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const VoyageCode3Literal = "voyage-code-3";
const VoyageCode3Description = "Optimized for code retrieval.";

const VoyageCode3Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageCode3Literal,
  description: VoyageCode3Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 2048 (default 1024; also supports 256, 512)
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[VoyageCode3Literal],
});

const VoyageCode3Options = BaseEmbeddingModelOptions;
type VoyageCode3OptionsType = z.infer<typeof VoyageCode3Options>;

class VoyageCode3 extends BaseEmbeddingModel {
  constructor(options: VoyageCode3OptionsType) {
    super(VoyageCode3Schema, options);
  }
}

export { VoyageCode3, VoyageCode3Options, VoyageCode3Schema, VoyageCode3Literal, type VoyageCode3OptionsType };
