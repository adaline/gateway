import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage3LiteLiteral = "voyage-3-lite";
const Voyage3LiteDescription = "Optimized for latency and cost.";

const Voyage3LiteSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage3LiteLiteral,
  description: Voyage3LiteDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 512
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const Voyage3LiteOptions = BaseEmbeddingModelOptions;
type Voyage3LiteOptionsType = z.infer<typeof Voyage3LiteOptions>;

class Voyage3Lite extends BaseEmbeddingModel {
  constructor(options: Voyage3LiteOptionsType) {
    super(Voyage3LiteSchema, options);
  }
}

export { Voyage3Lite, Voyage3LiteOptions, Voyage3LiteSchema, Voyage3LiteLiteral, type Voyage3LiteOptionsType };
