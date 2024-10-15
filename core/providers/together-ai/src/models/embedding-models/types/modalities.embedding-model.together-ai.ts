import { z } from "zod";

import { EmbeddingModelSchemaType } from "@adaline/provider";
import { EmbeddingTextModalityLiteral } from "@adaline/types";

const TogetherAIEmbeddingModelModalities: EmbeddingModelSchemaType["modalities"] = [EmbeddingTextModalityLiteral];

const TogetherAIEmbeddingModelModalitiesEnum = z.enum([EmbeddingTextModalityLiteral]);

export { TogetherAIEmbeddingModelModalitiesEnum, TogetherAIEmbeddingModelModalities };
