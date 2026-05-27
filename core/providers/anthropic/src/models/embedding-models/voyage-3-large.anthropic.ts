import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage3LargeLiteral = "voyage-3-large";
const Voyage3LargeDescription = "Optimized for the highest general-purpose and multilingual retrieval quality.";

const Voyage3LargeSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage3LargeLiteral,
  description: Voyage3LargeDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 2048 (default 1024; also supports 256, 512)
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage3LargeLiteral],
});

const Voyage3LargeOptions = BaseEmbeddingModelOptions;
type Voyage3LargeOptionsType = z.infer<typeof Voyage3LargeOptions>;

class Voyage3Large extends BaseEmbeddingModel {
  constructor(options: Voyage3LargeOptionsType) {
    super(Voyage3LargeSchema, options);
  }
}

export { Voyage3Large, Voyage3LargeOptions, Voyage3LargeSchema, Voyage3LargeLiteral, type Voyage3LargeOptionsType };
