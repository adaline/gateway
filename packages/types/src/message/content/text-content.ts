import { z } from "zod";

const TextModalityLiteral = "text" as const;

const TextContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(TextModalityLiteral),
    value: z.string(),
    metadata: Metadata,
  });
type TextContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof TextContent<M>>>;
const PartialTextModalityLiteral = "partial-text" as const;

const PartialTextContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialTextModalityLiteral),
    value: z.string(),
    metadata: Metadata,
  });
type PartialTextContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialTextContent<M>>>;

export {
  TextContent,
  PartialTextContent,
  TextModalityLiteral,
  PartialTextModalityLiteral,
  type TextContentType,
  type PartialTextContentType,
};
