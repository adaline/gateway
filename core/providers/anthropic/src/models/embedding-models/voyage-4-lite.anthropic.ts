import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage4LiteLiteral = "voyage-4-lite";
const Voyage4LiteDescription = "Lower-latency, lower-cost general-purpose retrieval. 32K input tokens.";

const Voyage4LiteSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage4LiteLiteral,
  description: Voyage4LiteDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000,
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage4LiteLiteral],
});

const Voyage4LiteOptions = BaseEmbeddingModelOptions;
type Voyage4LiteOptionsType = z.infer<typeof Voyage4LiteOptions>;

class Voyage4Lite extends BaseEmbeddingModel {
  constructor(options: Voyage4LiteOptionsType) {
    super(Voyage4LiteSchema, options);
  }
}

export { Voyage4Lite, Voyage4LiteOptions, Voyage4LiteSchema, Voyage4LiteLiteral, type Voyage4LiteOptionsType };
