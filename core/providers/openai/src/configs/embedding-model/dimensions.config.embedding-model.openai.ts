import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./base.config.embedding-model.openai";
import { dimensions } from "./common.config.embedding-model.openai";

const EmbeddingModelDimensionsConfigSchema = (maxDimensions: number) =>
  EmbeddingModelBaseConfigSchema().extend({
    dimensions: dimensions(maxDimensions).schema,
  });

const EmbeddingModelDimensionsConfigDef = (maxDimensions: number) =>
  ({
    ...EmbeddingModelBaseConfigDef(),
    dimensions: dimensions(maxDimensions).def,
  }) as const;

export { EmbeddingModelDimensionsConfigDef, EmbeddingModelDimensionsConfigSchema };
