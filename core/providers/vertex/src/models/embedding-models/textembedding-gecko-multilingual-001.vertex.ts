import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { VertexEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.vertex";
import { VertexEmbeddingModelModalities, VertexEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_Gecko_Multilingual_001Literal = "textembedding-gecko-multilingual@001";
const Text_Embedding_Gecko_Multilingual_001_Description = "textembedding-gecko-multilingual@001";

const Text_Embedding_Gecko_Multilingual_001Schema = EmbeddingModelSchema(VertexEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_Gecko_Multilingual_001Literal,
  description: Text_Embedding_Gecko_Multilingual_001_Description,
  modalities: VertexEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: VertexEmbeddingModelConfigs.base(768).def,
    schema: VertexEmbeddingModelConfigs.base(768).schema,
  },
});

const Text_Embedding_Gecko_Multilingual_001Options = BaseEmbeddingModelOptions;
type Text_Embedding_Gecko_Multilingual_001OptionsType = z.infer<typeof Text_Embedding_Gecko_Multilingual_001Options>;

class Text_Embedding_Gecko_Multilingual_001 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_Gecko_Multilingual_001OptionsType) {
    super(Text_Embedding_Gecko_Multilingual_001Schema, options);
  }
}

export {
  Text_Embedding_Gecko_Multilingual_001,
  Text_Embedding_Gecko_Multilingual_001Options,
  Text_Embedding_Gecko_Multilingual_001Schema,
  Text_Embedding_Gecko_Multilingual_001Literal,
  type Text_Embedding_Gecko_Multilingual_001OptionsType,
};
