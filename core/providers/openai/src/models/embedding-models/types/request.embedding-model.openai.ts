import { z } from "zod";

const OpenAIEmbeddingRequestInput = z
  .string()
  .min(1)
  .or(z.array(z.string().min(1)).min(1))
  .or(z.array(z.number().int().nonnegative()).min(1))
  .or(z.array(z.array(z.number().int().nonnegative()).min(1)).min(1));
type OpenAIEmbeddingRequestInputType = z.infer<typeof OpenAIEmbeddingRequestInput>;

const OpenAIEmbeddingRequest = z.object({
  model: z.string().min(1).optional(),
  input: OpenAIEmbeddingRequestInput,
  encoding_format: z.enum(["float", "base64"]).optional(),
  dimensions: z.number().int().min(1).optional(),
});
type OpenAIEmbeddingRequestType = z.infer<typeof OpenAIEmbeddingRequest>;

export { OpenAIEmbeddingRequest, OpenAIEmbeddingRequestInput, type OpenAIEmbeddingRequestType, type OpenAIEmbeddingRequestInputType };
