import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import embeddingPricingData from "../embedding-pricing.json";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage4NanoLiteral = "voyage-4-nano";
const Voyage4NanoDescription = "Smallest, fastest Voyage embedding for edge / open-weight deployments. 32K input tokens.";

const Voyage4NanoSchema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage4NanoLiteral,
  description: Voyage4NanoDescription,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000,
  config: {
    def: AnthropicEmbeddingModelConfigs.flexible().def,
    schema: AnthropicEmbeddingModelConfigs.flexible().schema,
  },
  price: embeddingPricingData[Voyage4NanoLiteral],
});

const Voyage4NanoOptions = BaseEmbeddingModelOptions;
type Voyage4NanoOptionsType = z.infer<typeof Voyage4NanoOptions>;

class Voyage4Nano extends BaseEmbeddingModel {
  constructor(options: Voyage4NanoOptionsType) {
    super(Voyage4NanoSchema, options);
  }
}

export { Voyage4Nano, Voyage4NanoOptions, Voyage4NanoSchema, Voyage4NanoLiteral, type Voyage4NanoOptionsType };
