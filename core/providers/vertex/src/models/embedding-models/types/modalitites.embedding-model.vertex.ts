import { z } from "zod";

import { EmbeddingModelSchemaType } from "@adaline/provider";
import { EmbeddingTextModalityLiteral } from "@adaline/types";

const VertexEmbeddingModelModalities: EmbeddingModelSchemaType["modalities"] = [EmbeddingTextModalityLiteral];

const VertexEmbeddingModelModalitiesEnum = z.enum([EmbeddingTextModalityLiteral]);

export { VertexEmbeddingModelModalitiesEnum, VertexEmbeddingModelModalities };
