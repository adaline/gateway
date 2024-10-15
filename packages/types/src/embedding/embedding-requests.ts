import { z } from "zod";

const EmbeddingTextModalityLiteral = "text" as const;
const EmbeddingTokenModalityLiteral = "token" as const;

const EmbeddingModalityLiterals = [EmbeddingTextModalityLiteral, EmbeddingTokenModalityLiteral] as const;
const EmbeddingModalityEnum = z.enum(EmbeddingModalityLiterals);
type EmbeddingModalityEnumType = z.infer<typeof EmbeddingModalityEnum>;

const TextEmbeddingRequests = z.array(z.string().min(1));
type TextEmbeddingRequestsType = z.infer<typeof TextEmbeddingRequests>;

const TokenEmbeddingRequests = z.array(z.array(z.number().int().nonnegative()));
type TokenEmbeddingRequestsType = z.infer<typeof TokenEmbeddingRequests>;

const EmbeddingRequests = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.discriminatedUnion("modality", [
    z.object({
      modality: z.literal(EmbeddingTextModalityLiteral),
      metadata: Metadata,
      requests: TextEmbeddingRequests,
    }),
    z.object({
      modality: z.literal(EmbeddingTokenModalityLiteral),
      metadata: Metadata,
      requests: TokenEmbeddingRequests,
    }),
  ]);
type EmbeddingRequestsType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof EmbeddingRequests<M>>>;

export {
  EmbeddingTextModalityLiteral,
  EmbeddingTokenModalityLiteral,
  EmbeddingModalityLiterals,
  EmbeddingModalityEnum,
  TextEmbeddingRequests,
  TokenEmbeddingRequests,
  EmbeddingRequests,
  type EmbeddingRequestsType,
  type EmbeddingModalityEnumType,
  type TextEmbeddingRequestsType,
  type TokenEmbeddingRequestsType,
};
