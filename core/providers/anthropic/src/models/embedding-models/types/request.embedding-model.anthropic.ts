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
  // Flexible-dimension models only (voyage-3.5 family, voyage-3-large, voyage-code-3).
  output_dimension: z
    .union([z.literal(256), z.literal(512), z.literal(1024), z.literal(2048)])
    .nullable()
    .optional(),
  output_dtype: z.enum(["float", "int8", "uint8", "binary", "ubinary"]).nullable().optional(),
});
type AnthropicEmbeddingRequestType = z.infer<typeof AnthropicEmbeddingRequest>;

export {
  AnthropicEmbeddingRequest,
  AnthropicEmbeddingRequestInput,
  type AnthropicEmbeddingRequestInputType,
  type AnthropicEmbeddingRequestType,
};
