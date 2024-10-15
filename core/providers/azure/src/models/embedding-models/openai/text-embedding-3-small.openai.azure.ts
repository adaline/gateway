import { z } from "zod";

import { Text_Embedding_3_SmallSchema as OpenAI_Text_Embedding_3_SmallSchema } from "@adaline/openai";

import { BaseEmbeddingModelOptions } from "../embedding-model-options.azure";
import { BaseEmbeddingModelOpenAI } from "./base-embedding-model.openai.azure";

const Text_Embedding_3_SmallLiteral = "text-embedding-3-small" as const;
const Text_Embedding_3_SmallSchema = OpenAI_Text_Embedding_3_SmallSchema;
const Text_Embedding_3_SmallOptions = BaseEmbeddingModelOptions;
type Text_Embedding_3_SmallOptionsType = z.infer<typeof Text_Embedding_3_SmallOptions>;

class Text_Embedding_3_Small extends BaseEmbeddingModelOpenAI {
  constructor(options: Text_Embedding_3_SmallOptionsType) {
    super(Text_Embedding_3_SmallSchema, options);
  }
}

export {
  Text_Embedding_3_Small,
  Text_Embedding_3_SmallOptions,
  Text_Embedding_3_SmallSchema,
  Text_Embedding_3_SmallLiteral,
  type Text_Embedding_3_SmallOptionsType,
};
