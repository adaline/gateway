import { z } from "zod";

import { dimensions } from "./common.config.embedding-model.google";

const EmbeddingModelBaseConfigSchema = (maxDimensions: number) =>
  z.object({
    dimensions: dimensions(maxDimensions).schema,
  });

const EmbeddingModelBaseConfigDef = (maxDimensions: number) =>
  ({
    dimensions: dimensions(maxDimensions).def,
  }) as const;

export { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema };
