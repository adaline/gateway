import { z } from "zod";

const AnthropicGetEmbeddingsResponse = z.object({
  object: z.literal("list"),
  model: z.string(),
  data: z.array(
    z.object({
      index: z.number(),
      object: z.literal("embedding"),
      embedding: z.array(z.number()).or(z.string().base64()),
    })
  ),
  usage: z.object({
    total_tokens: z.number(),
  }),
});

export { AnthropicGetEmbeddingsResponse };
