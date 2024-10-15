import { z } from "zod";

import { EmbeddingModelSchemaType } from "@adaline/provider";
import { EmbeddingTextModalityLiteral } from "@adaline/types";

const GoogleEmbeddingModelModalities: EmbeddingModelSchemaType["modalities"] = [EmbeddingTextModalityLiteral];

const GoogleEmbeddingModelModalitiesEnum = z.enum([EmbeddingTextModalityLiteral]);

export { GoogleEmbeddingModelModalitiesEnum, GoogleEmbeddingModelModalities };
