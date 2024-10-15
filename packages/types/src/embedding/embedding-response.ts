import { z } from "zod";

const FloatEmbeddingLiteral = "float" as const;
const FloatEmbedding = z.object({
  index: z.number().int().nonnegative(),
  embedding: z.array(z.number()),
});
type FloatEmbeddingType = z.infer<typeof FloatEmbedding>;

const Base64EmbeddingLiteral = "base64" as const;
const Base64Embedding = z.object({
  index: z.number().int().nonnegative(),
  embedding: z.string().base64(),
});
type Base64EmbeddingType = z.infer<typeof Base64Embedding>;

const EmbeddingsUsage = z.object({
  totalTokens: z.number().int().nonnegative(),
});
type EmbeddingsUsageType = z.infer<typeof EmbeddingsUsage>;

const EmbeddingResponse = z.discriminatedUnion("encodingFormat", [
  z.object({
    encodingFormat: z.literal(FloatEmbeddingLiteral),
    embeddings: z.array(FloatEmbedding),
    usage: EmbeddingsUsage.optional(),
  }),
  z.object({
    encodingFormat: z.literal(Base64EmbeddingLiteral),
    embeddings: z.array(Base64Embedding),
    usage: EmbeddingsUsage.optional(),
  }),
]);
type EmbeddingResponseType = z.infer<typeof EmbeddingResponse>;

export {
  FloatEmbeddingLiteral,
  Base64EmbeddingLiteral,
  FloatEmbedding,
  Base64Embedding,
  EmbeddingsUsage,
  EmbeddingResponse,
  type FloatEmbeddingType,
  type Base64EmbeddingType,
  type EmbeddingsUsageType,
  type EmbeddingResponseType,
};
