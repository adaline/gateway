import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { VertexEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.vertex";
import { VertexEmbeddingModelModalities, VertexEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_Gecko_003Literal = "textembedding-gecko@003";
const Text_Embedding_Gecko_003_Description = "textembedding-gecko@003";

const Text_Embedding_Gecko_003Schema = EmbeddingModelSchema(VertexEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_Gecko_003Literal,
  description: Text_Embedding_Gecko_003_Description,
  modalities: VertexEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: VertexEmbeddingModelConfigs.base(768).def,
    schema: VertexEmbeddingModelConfigs.base(768).schema,
  },
});

const Text_Embedding_Gecko_003Options = BaseEmbeddingModelOptions;
type Text_Embedding_Gecko_003OptionsType = z.infer<typeof Text_Embedding_Gecko_003Options>;

class Text_Embedding_Gecko_003 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_Gecko_003OptionsType) {
    super(Text_Embedding_Gecko_003Schema, options);
  }
}

export {
  Text_Embedding_Gecko_003,
  Text_Embedding_Gecko_003Options,
  Text_Embedding_Gecko_003Schema,
  Text_Embedding_Gecko_003Literal,
  type Text_Embedding_Gecko_003OptionsType,
};
