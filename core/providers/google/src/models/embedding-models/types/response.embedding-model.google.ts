import { z } from "zod";

const GoogleGetEmbeddingsResponse = z.object({
  embeddings: z.array(
    z.object({
      values: z.array(z.number()),
    })
  ),
});
type GoogleGetEmbeddingsResponseType = z.infer<typeof GoogleGetEmbeddingsResponse>;

export { GoogleGetEmbeddingsResponse, type GoogleGetEmbeddingsResponseType };
