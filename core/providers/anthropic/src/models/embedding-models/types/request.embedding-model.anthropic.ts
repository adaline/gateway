import { z } from "zod";

const AnthropicEmbeddingRequestInput = z
  .string()
  .min(1)
  .or(z.array(z.string().min(1)).min(1));
type AnthropicEmbeddingRequestInputType = z.infer<typeof AnthropicEmbeddingRequestInput>;

const AnthropicEmbeddingRequest = z.object({
  model: z.string().min(1).optional(),
  input: AnthropicEmbeddingRequestInput,
  encoding_format: z.enum(["base64"]).nullable().optional(),
  input_type: z.enum(["query", "document"]).nullable().optional(),
  truncation: z.boolean().optional(),
});
type AnthropicEmbeddingRequestType = z.infer<typeof AnthropicEmbeddingRequest>;

export {
  AnthropicEmbeddingRequest,
  AnthropicEmbeddingRequestInput,
  type AnthropicEmbeddingRequestInputType,
  type AnthropicEmbeddingRequestType,
};
