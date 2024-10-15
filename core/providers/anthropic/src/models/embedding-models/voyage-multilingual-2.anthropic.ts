import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const VoyageMultilingual2Literal = "voyage-multilingual-2";
const VoyageMultilingual2Description = "Optimized for multilingual retrieval and RAG.";

const VoyageMultilingual2Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageMultilingual2Literal,
  description: VoyageMultilingual2Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 1024
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const VoyageMultilingual2Options = BaseEmbeddingModelOptions;
type VoyageMultilingual2OptionsType = z.infer<typeof VoyageMultilingual2Options>;

class VoyageMultilingual2 extends BaseEmbeddingModel {
  constructor(options: VoyageMultilingual2OptionsType) {
    super(VoyageMultilingual2Schema, options);
  }
}

export {
  VoyageMultilingual2,
  VoyageMultilingual2Options,
  VoyageMultilingual2Schema,
  VoyageMultilingual2Literal,
  type VoyageMultilingual2OptionsType,
};
