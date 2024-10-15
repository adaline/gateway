import { z } from "zod";

const GoogleEmbeddingRequestInput = z.object({
  model: z.string().min(1),
  content: z.object({
    parts: z
      .array(
        z.object({
          text: z.string().min(1),
        })
      )
      .min(1),
  }),
});
type GoogleEmbeddingRequestInputType = z.infer<typeof GoogleEmbeddingRequestInput>;

const GoogleEmbeddingRequest = z.object({
  model: z.string().min(1).optional(),
  requests: z.array(GoogleEmbeddingRequestInput).min(1),
  outputDimensionality: z.number().int().min(1).optional(),
});
type GoogleEmbeddingRequestType = z.infer<typeof GoogleEmbeddingRequest>;

export { GoogleEmbeddingRequest, GoogleEmbeddingRequestInput, type GoogleEmbeddingRequestType, type GoogleEmbeddingRequestInputType };
