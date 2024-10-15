import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { OpenAIEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.openai";
import { OpenAIEmbeddingModelModalities, OpenAIEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_Ada002Literal = "text-embedding-ada-002";
const Text_Embedding_Ada002Description = "Most capable 2nd generation embedding model, replacing 16 first generation models";

const Text_Embedding_Ada002Schema = EmbeddingModelSchema(OpenAIEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_Ada002Literal,
  description: Text_Embedding_Ada002Description,
  modalities: OpenAIEmbeddingModelModalities,
  maxInputTokens: 8192,
  maxOutputTokens: 1536,
  config: {
    def: OpenAIEmbeddingModelConfigs.base().def,
    schema: OpenAIEmbeddingModelConfigs.base().schema,
  },
});

const Text_Embedding_Ada002_Options = BaseEmbeddingModelOptions;
type Text_Embedding_Ada002_OptionsType = z.infer<typeof Text_Embedding_Ada002_Options>;

class Text_Embedding_Ada002 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_Ada002_OptionsType) {
    super(Text_Embedding_Ada002Schema, options);
  }
}

export {
  Text_Embedding_Ada002,
  Text_Embedding_Ada002_Options,
  Text_Embedding_Ada002Schema,
  Text_Embedding_Ada002Literal,
  type Text_Embedding_Ada002_OptionsType,
};
