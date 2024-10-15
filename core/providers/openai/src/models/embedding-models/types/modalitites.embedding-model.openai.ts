import { z } from "zod";

import { EmbeddingModelSchemaType } from "@adaline/provider";
import { EmbeddingTextModalityLiteral, EmbeddingTokenModalityLiteral } from "@adaline/types";

const OpenAIEmbeddingModelModalities: EmbeddingModelSchemaType["modalities"] = [
  EmbeddingTextModalityLiteral,
  EmbeddingTokenModalityLiteral,
];

const OpenAIEmbeddingModelModalitiesEnum = z.enum([EmbeddingTextModalityLiteral, EmbeddingTokenModalityLiteral]);

export { OpenAIEmbeddingModelModalitiesEnum, OpenAIEmbeddingModelModalities };
