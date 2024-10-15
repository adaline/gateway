import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { OpenAIEmbeddingModelConfigs } from "../../configs";
import { BaseEmbeddingModel, BaseEmbeddingModelOptions } from "./base-embedding-model.openai";
import { OpenAIEmbeddingModelModalities, OpenAIEmbeddingModelModalitiesEnum } from "./types";

const Text_Embedding_3_SmallLiteral = "text-embedding-3-small";
const Text_Embedding_3_SmallDescription = "Increased performance over 2nd generation ada embedding model";

const Text_Embedding_3_SmallSchema = EmbeddingModelSchema(OpenAIEmbeddingModelModalitiesEnum).parse({
  name: Text_Embedding_3_SmallLiteral,
  description: Text_Embedding_3_SmallDescription,
  modalities: OpenAIEmbeddingModelModalities,
  maxInputTokens: 8192,
  maxOutputTokens: 1536,
  config: {
    def: OpenAIEmbeddingModelConfigs.dimensions(1536).def,
    schema: OpenAIEmbeddingModelConfigs.dimensions(1536).schema,
  },
});

const Text_Embedding_3_Small_Options = BaseEmbeddingModelOptions;
type Text_Embedding_3_Small_OptionsType = z.infer<typeof Text_Embedding_3_Small_Options>;

class Text_Embedding_3_Small extends BaseEmbeddingModel {
  constructor(options: Text_Embedding_3_Small_OptionsType) {
    super(Text_Embedding_3_SmallSchema, options);
  }
}

export {
  Text_Embedding_3_Small,
  Text_Embedding_3_Small_Options,
  Text_Embedding_3_SmallSchema,
  Text_Embedding_3_SmallLiteral,
  type Text_Embedding_3_Small_OptionsType,
};
