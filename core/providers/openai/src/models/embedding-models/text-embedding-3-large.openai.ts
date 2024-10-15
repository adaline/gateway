import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { OpenAIEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.openai";
import { OpenAIEmbeddingModelModalities, OpenAIEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_3_LargeLiteral = "text-embedding-3-large";
const Text_Embedding_3_LargeDescription = "Most capable embedding model for both english and non-english tasks";

const Text_Embedding_3_LargeSchema = EmbeddingModelSchema(OpenAIEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_3_LargeLiteral,
  description: Text_Embedding_3_LargeDescription,
  modalities: OpenAIEmbeddingModelModalities,
  maxInputTokens: 8192,
  maxOutputTokens: 3072,
  config: {
    def: OpenAIEmbeddingModelConfigs.dimensions(3072).def,
    schema: OpenAIEmbeddingModelConfigs.dimensions(3072).schema,
  },
});

const Text_Embedding_3_Large_Options = BaseEmbeddingModelOptions;
type Text_Embedding_3_Large_OptionsType = z.infer<typeof Text_Embedding_3_Large_Options>;

class Text_Embedding_3_Large extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_3_Large_OptionsType) {
    super(Text_Embedding_3_LargeSchema, options);
  }
}

export {
  Text_Embedding_3_Large,
  Text_Embedding_3_Large_Options,
  Text_Embedding_3_LargeSchema,
  Text_Embedding_3_LargeLiteral,
  type Text_Embedding_3_Large_OptionsType,
};
