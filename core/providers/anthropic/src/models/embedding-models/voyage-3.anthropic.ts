import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const Voyage3Literal = "voyage-3";
const Voyage3Description = "Optimized for quality.";

const Voyage3Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: Voyage3Literal,
  description: Voyage3Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 1024
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const Voyage3Options = BaseEmbeddingModelOptions;
type Voyage3OptionsType = z.infer<typeof Voyage3Options>;

class Voyage3 extends BaseEmbeddingModel {
  constructor(options: Voyage3OptionsType) {
    super(Voyage3Schema, options);
  }
}

export { Voyage3, Voyage3Options, Voyage3Schema, Voyage3Literal, type Voyage3OptionsType };
