import { z } from "zod";

const VertexEmbeddingRequest = z.object({
  model: z.string().min(1).optional(),
  instances: z
    .array(
      z.object({
        content: z.string().min(1),
      })
    )
    .min(1),
  parameters: z
    .object({
      auto_truncate: z.boolean().optional(),
      output_dimensionality: z.number().int().min(1).optional(),
      autoTruncate: z.boolean().optional(),
      outputDimensionality: z.number().int().min(1).optional(),
    })
    .optional(),
});

type VertexEmbeddingRequestType = z.infer<typeof VertexEmbeddingRequest>;

export { VertexEmbeddingRequest, type VertexEmbeddingRequestType };
