import { z } from "zod";

const OpenAIGetEmbeddingsResponse = z.object({
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
    prompt_tokens: z.number().nonnegative(),
    total_tokens: z.number().nonnegative(),
  }),
});

export { OpenAIGetEmbeddingsResponse };
