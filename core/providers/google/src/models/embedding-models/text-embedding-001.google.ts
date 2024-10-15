import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { GoogleEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.google";
import { GoogleEmbeddingModelModalities, GoogleEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_001Literal = "text-embedding-001";
const Text_Embedding_001_Description = "text-embedding-001";

const Text_Embedding_001Schema = EmbeddingModelSchema(GoogleEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_001Literal,
  description: Text_Embedding_001_Description,
  modalities: GoogleEmbeddingModelModalities,
  maxInputTokens: 2048,
  maxOutputTokens: 768,
  config: {
    def: GoogleEmbeddingModelConfigs.base(768).def,
    schema: GoogleEmbeddingModelConfigs.base(768).schema,
  },
});

const Text_Embedding_001Options = BaseEmbeddingModelOptions;
type Text_Embedding_001OptionsType = z.infer<typeof Text_Embedding_001Options>;

class Text_Embedding_001 extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_001OptionsType) {
    super(Text_Embedding_001Schema, options);
  }
}

export {
  Text_Embedding_001,
  Text_Embedding_001Options,
  Text_Embedding_001Schema,
  Text_Embedding_001Literal,
  type Text_Embedding_001OptionsType,
};
