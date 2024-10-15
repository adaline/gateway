import { z } from "zod";

const ToolResponseModalityLiteral = "tool-response" as const;

const ToolResponseContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ToolResponseModalityLiteral),
    index: z.number().int().nonnegative(),
    id: z.string().min(1),
    name: z.string().min(1),
    data: z.string(),
    metadata: Metadata,
  });
type ToolResponseContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ToolResponseContent<M>>>;

export { ToolResponseContent, ToolResponseModalityLiteral, type ToolResponseContentType };
