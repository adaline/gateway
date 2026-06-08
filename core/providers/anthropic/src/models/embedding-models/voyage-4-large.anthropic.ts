import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage4LargeLiteral = "voyage-4-large";
const Voyage4LargeDescription = "Highest-quality general-purpose and multilingual retrieval. 32K input tokens.";

const Voyage4LargeSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage4LargeLiteral,
  description: Voyage4LargeDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000,
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage4LargeLiteral],
});

const Voyage4LargeOptions = BaseEmbeddingModelOptions;
type Voyage4LargeOptionsType = z.infer<typeof Voyage4LargeOptions>;

class Voyage4Large extends BaseEmbeddingModel {
  constructor(options: Voyage4LargeOptionsType) {
    super(Voyage4LargeSchema, options);
  }
}

export { Voyage4Large, Voyage4LargeOptions, Voyage4LargeSchema, Voyage4LargeLiteral, type Voyage4LargeOptionsType };
