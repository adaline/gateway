import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const VoyageCode2Literal = "voyage-code-2";
const VoyageCode2Description = "Optimized for code retrieval.";

const VoyageCode2Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageCode2Literal,
  description: VoyageCode2Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 16000,
  maxOutputTokens: 16000, // max output dimensions are 1536
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const VoyageCode2Options = BaseEmbeddingModelOptions;
type VoyageCode2OptionsType = z.infer<typeof VoyageCode2Options>;

class VoyageCode2 extends BaseEmbeddingModel {
  constructor(options: VoyageCode2OptionsType) {
    super(VoyageCode2Schema, options);
  }
}

export { VoyageCode2, VoyageCode2Options, VoyageCode2Schema, VoyageCode2Literal, type VoyageCode2OptionsType };
