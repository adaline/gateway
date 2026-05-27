import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage3_5Literal = "voyage-3.5";
const Voyage3_5Description = "Optimized for general-purpose and multilingual retrieval quality.";

const Voyage3_5Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage3_5Literal,
  description: Voyage3_5Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 2048 (default 1024; also supports 256, 512)
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage3_5Literal],
});

const Voyage3_5Options = BaseEmbeddingModelOptions;
type Voyage3_5OptionsType = z.infer<typeof Voyage3_5Options>;

class Voyage3_5 extends BaseEmbeddingModel {
  constructor(options: Voyage3_5OptionsType) {
    super(Voyage3_5Schema, options);
  }
}

export { Voyage3_5, Voyage3_5Options, Voyage3_5Schema, Voyage3_5Literal, type Voyage3_5OptionsType };
