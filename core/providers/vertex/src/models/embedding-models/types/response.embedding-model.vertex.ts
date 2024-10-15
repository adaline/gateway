import { z } from "zod";

const VertexGetEmbeddingsResponse = z.object({
  predictions: z.array(
    z.object({
      embeddings: z.object({
        values: z.array(z.number()),
        statistics: z.object({
          token_count: z.number(),
          truncated: z.boolean(),
        }),
      }),
    })
  ),
});

type VertexGetEmbeddingsResponseType = z.infer<typeof VertexGetEmbeddingsResponse>;

export { VertexGetEmbeddingsResponse, type VertexGetEmbeddingsResponseType };
