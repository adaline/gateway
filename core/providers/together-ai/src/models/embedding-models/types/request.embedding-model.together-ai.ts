import { z } from "zod";

const TogetherAIEmbeddingRequestInput = z
  .string()
  .min(1)
  .or(z.array(z.string().min(1)).min(1));
type TogetherAIEmbeddingRequestInputType = z.infer<typeof TogetherAIEmbeddingRequestInput>;

const TogetherAIEmbeddingRequest = z.object({
  model: z.string().min(1).optional(),
  input: TogetherAIEmbeddingRequestInput,
});
type TogetherAIEmbeddingRequestType = z.infer<typeof TogetherAIEmbeddingRequest>;

export {
  TogetherAIEmbeddingRequest,
  TogetherAIEmbeddingRequestInput,
  type TogetherAIEmbeddingRequestType,
  type TogetherAIEmbeddingRequestInputType,
};
