import { z } from "zod";

import { Text_Embedding_Ada002Schema as OpenAI_Text_Embedding_Ada_002Schema } from "@adaline/openai";

import { BaseEmbeddingModelOptions } from "../embedding-model-options.azure";
import { BaseEmbeddingModelOpenAI } from "./base-embedding-model.openai.azure";

// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2028-02-09.
const Text_Embedding_Ada_002Literal = "text-embedding-ada-002" as const;
const Text_Embedding_Ada_002Schema = OpenAI_Text_Embedding_Ada_002Schema;
const Text_Embedding_Ada_002Options = BaseEmbeddingModelOptions;
type Text_Embedding_Ada_002OptionsType = z.infer<typeof Text_Embedding_Ada_002Options>;

class Text_Embedding_Ada_002 extends BaseEmbeddingModelOpenAI {
  constructor(options: Text_Embedding_Ada_002OptionsType) {
    super(Text_Embedding_Ada_002Schema, options);
  }
}

export {
  Text_Embedding_Ada_002,
  Text_Embedding_Ada_002Options,
  Text_Embedding_Ada_002Schema,
  Text_Embedding_Ada_002Literal,
  type Text_Embedding_Ada_002OptionsType,
};
