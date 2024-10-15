import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { AnthropicEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.anthropic";
import { AnthropicEmbeddingModelModalities, AnthropicEmbeddingModelModalitiesEnum } from "./types";

const VoyageFinance2Literal = "voyage-finance-2";
const VoyageFinance2Description = "Optimized for finance retrieval and RAG.";

const VoyageFinance2Schema = EmbeddingModelSchema(AnthropicEmbeddingModelModalitiesEnum).parse({
  name: VoyageFinance2Literal,
  description: VoyageFinance2Description,
  modalities: AnthropicEmbeddingModelModalities,
  maxInputTokens: 32000,
  maxOutputTokens: 32000, // max output dimensions are 1024
  config: {
    def: AnthropicEmbeddingModelConfigs.base().def,
    schema: AnthropicEmbeddingModelConfigs.base().schema,
  },
});

const VoyageFinance2Options = BaseEmbeddingModelOptions;
type VoyageFinance2OptionsType = z.infer<typeof VoyageFinance2Options>;

class VoyageFinance2 extends BaseEmbeddingModel {
  constructor(options: VoyageFinance2OptionsType) {
    super(VoyageFinance2Schema, options);
  }
}

export { VoyageFinance2, VoyageFinance2Options, VoyageFinance2Schema, VoyageFinance2Literal, type VoyageFinance2OptionsType };
