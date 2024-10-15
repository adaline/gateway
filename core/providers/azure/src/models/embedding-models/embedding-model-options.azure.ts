import { z } from "zod";

const BaseEmbeddingModelOptions = z.object({
  apiKey: z.string().min(1),
  deploymentId: z.string().min(1),
  resourceName: z.string().min(1).optional(),
  baseUrl: z.string().optional(),
});

type BaseEmbeddingModelOptionsType = z.infer<typeof BaseEmbeddingModelOptions>;

export { BaseEmbeddingModelOptions, type BaseEmbeddingModelOptionsType };
