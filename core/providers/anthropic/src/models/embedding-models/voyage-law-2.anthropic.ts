import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const VoyageLaw2Literal = "voyage-law-2";
const VoyageLaw2Description = "Optimized for legal and long-context retrieval and RAG. Also improved performance across all domains.";

const VoyageLaw2Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageLaw2Literal,
  description: VoyageLaw2Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 16000,
  maxOutputTokens: 16000, // max output dimensions are 1024
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const VoyageLaw2Options = BaseEmbeddingModelOptions;
type VoyageLaw2OptionsType = z.infer<typeof VoyageLaw2Options>;

class VoyageLaw2 extends BaseEmbeddingModel {
  constructor(options: VoyageLaw2OptionsType) {
    super(VoyageLaw2Schema, options);
  }
}

export { VoyageLaw2, VoyageLaw2Options, VoyageLaw2Schema, VoyageLaw2Literal, type VoyageLaw2OptionsType };
