import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage4Literal = "voyage-4";
const Voyage4Description = "Best balance of quality and cost for general-purpose retrieval. 32K input tokens.";

const Voyage4Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage4Literal,
  description: Voyage4Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000,
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage4Literal],
});

const Voyage4Options = BaseEmbeddingModelOptions;
type Voyage4OptionsType = z.infer<typeof Voyage4Options>;

class Voyage4 extends BaseEmbeddingModel {
  constructor(options: Voyage4OptionsType) {
    super(Voyage4Schema, options);
  }
}

export { Voyage4, Voyage4Options, Voyage4Schema, Voyage4Literal, type Voyage4OptionsType };
