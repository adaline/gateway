import { z } from "zod";

import { EmbeddingModelSchemaType } from "@adaline/provider";
import { EmbeddingTextModalityLiteral } from "@adaline/types";

const AnthropicEmbeddingModelModalities: EmbeddingModelSchemaType["modalities"] = [EmbeddingTextModalityLiteral];

const AnthropicEmbeddingModelModalitiesEnum = z.enum([EmbeddingTextModalityLiteral]);

export { AnthropicEmbeddingModelModalitiesEnum, AnthropicEmbeddingModelModalities };
