import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage3_5LiteLiteral = "voyage-3.5-lite";
const Voyage3_5LiteDescription = "Optimized for latency and cost.";

const Voyage3_5LiteSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage3_5LiteLiteral,
  description: Voyage3_5LiteDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 2048 (default 1024; also supports 256, 512)
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage3_5LiteLiteral],
});

const Voyage3_5LiteOptions = BaseEmbeddingModelOptions;
type Voyage3_5LiteOptionsType = z.infer<typeof Voyage3_5LiteOptions>;

class Voyage3_5Lite extends BaseEmbeddingModel {
  constructor(options: Voyage3_5LiteOptionsType) {
    super(Voyage3_5LiteSchema, options);
  }
}

export { Voyage3_5Lite, Voyage3_5LiteOptions, Voyage3_5LiteSchema, Voyage3_5LiteLiteral, type Voyage3_5LiteOptionsType };
