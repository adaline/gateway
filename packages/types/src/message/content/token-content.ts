import { z } from "zod";

const TokenModalityLiteral = "token" as const;

const TokenContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(TokenModalityLiteral),
    value: z.array(z.number().int().nonnegative()),
    metadata: Metadata,
  });
type TokenContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof TokenContent<M>>>;

export { TokenContent, TokenModalityLiteral, type TokenContentType };
