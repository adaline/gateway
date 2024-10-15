import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { GoogleEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.google";
import { GoogleEmbeddingModelModalities, GoogleEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_004Literal = "text-embedding-004";
const Text_Embedding_004_Description = "text-embedding-004";

const Text_Embedding_004Schema = EmbeddingModelSchema(GoogleEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_004Literal,
  description: Text_Embedding_004_Description,
  modalities: GoogleEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: GoogleEmbeddingModelConfigs.base(768).def,
    schema: GoogleEmbeddingModelConfigs.base(768).schema,
  },
});

const Text_Embedding_004Options = BaseEmbeddingModelOptions;
type Text_Embedding_004OptionsType = z.infer<typeof Text_Embedding_004Options>;

class Text_Embedding_004 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_004OptionsType) {
    super(Text_Embedding_004Schema, options);
  }
}

export {
  Text_Embedding_004,
  Text_Embedding_004Options,
  Text_Embedding_004Schema,
  Text_Embedding_004Literal,
  type Text_Embedding_004OptionsType,
};
