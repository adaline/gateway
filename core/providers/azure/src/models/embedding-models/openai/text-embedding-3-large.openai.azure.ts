import { z } from "zod";

import { Text_Embedding_3_LargeSchema as OpenAI_Text_Embedding_3_LargeSchema } from "@adaline/openai";

import { BaseEmbeddingModelOptions } from "../embedding-model-options.azure";
import { BaseEmbeddingModelOpenAI } from "./base-embedding-model.openai.azure";

// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2028-02-09.
const Text_Embedding_3_LargeLiteral = "text-embedding-3-large" as const;
const Text_Embedding_3_LargeSchema = OpenAI_Text_Embedding_3_LargeSchema;
const Text_Embedding_3_LargeOptions = BaseEmbeddingModelOptions;
type Text_Embedding_3_LargeOptionsType = z.infer<typeof Text_Embedding_3_LargeOptions>;

class Text_Embedding_3_Large extends BaseEmbeddingModelOpenAI {
  constructor(options: Text_Embedding_3_LargeOptionsType) {
    super(Text_Embedding_3_LargeSchema, options);
  }
}

export {
  Text_Embedding_3_Large,
  Text_Embedding_3_LargeOptions,
  Text_Embedding_3_LargeSchema,
  Text_Embedding_3_LargeLiteral,
  type Text_Embedding_3_LargeOptionsType,
};
