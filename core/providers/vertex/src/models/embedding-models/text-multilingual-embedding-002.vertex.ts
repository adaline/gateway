import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { VertexEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.vertex";
import { VertexEmbeddingModelModalities, VertexEmbeddingModelModalitiesEnum } from "./types";

const Text_Multilingual_Embedding_002Literal = "text-multilingual-embedding-002";
const Text_Multilingual_Embedding_002_Description = "text-multilingual-embedding-002";

const Text_Multilingual_Embedding_002Schema = EmbeddingModelSchema(VertexEmbeddingModelModalitiesEnum).parse({
  name: Text_Multilingual_Embedding_002Literal,
  description: Text_Multilingual_Embedding_002_Description,
  modalities: VertexEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: VertexEmbeddingModelConfigs.base(768).def,
    schema: VertexEmbeddingModelConfigs.base(768).schema,
  },
});

const Text_Multilingual_Embedding_002Options = BaseEmbeddingModelOptions;
type Text_Multilingual_Embedding_002OptionsType = z.infer<typeof Text_Multilingual_Embedding_002Options>;

class Text_Multilingual_Embedding_002 extends BaseEmbeddingModel {
  constructor(options: Text_Multilingual_Embedding_002OptionsType) {
    super(Text_Multilingual_Embedding_002Schema, options);
  }
}

export {
  Text_Multilingual_Embedding_002,
  Text_Multilingual_Embedding_002Options,
  Text_Multilingual_Embedding_002Schema,
  Text_Multilingual_Embedding_002Literal,
  type Text_Multilingual_Embedding_002OptionsType,
};
