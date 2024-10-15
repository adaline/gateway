import { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema } from "./embedding-model";

const VertexEmbeddingModelConfigs = {
  base: (maxDimensions: number) => ({
    def: EmbeddingModelBaseConfigDef(maxDimensions),
    schema: EmbeddingModelBaseConfigSchema(maxDimensions),
  }),
} as const;

export { VertexEmbeddingModelConfigs };
