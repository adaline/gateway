import { z } from "zod";

import { autoTruncate, dimensions } from "./common.config.embedding-model.vertex";

const EmbeddingModelBaseConfigSchema = (maxDimensions: number) =>
  z.object({
    dimensions: dimensions(maxDimensions).schema,
    autoTruncate: autoTruncate.schema,
  });

const EmbeddingModelBaseConfigDef = (maxDimensions: number) =>
  ({
    dimensions: dimensions(maxDimensions).def,
    autoTruncate: autoTruncate.def,
  }) as const;

export { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema };
