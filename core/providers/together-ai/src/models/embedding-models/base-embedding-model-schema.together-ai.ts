import { z } from "zod";

import { EmbeddingModelSchema } from "@adaline/provider";

import { TogetherAIEmbeddingModelModalities, TogetherAIEmbeddingModelModalitiesEnum } from "./types";

const BaseEmbeddingModelSchema = EmbeddingModelSchema(TogetherAIEmbeddingModelModalitiesEnum).parse({
  name: "__base__",
  description: "Base embedding model for Together AI",
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  modalities: TogetherAIEmbeddingModelModalities,
  config: {
    def: {},
    schema: z.object({}),
  },
});

export { BaseEmbeddingModelSchema };
