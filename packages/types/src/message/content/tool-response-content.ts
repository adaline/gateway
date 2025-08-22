import { z } from "zod";

const ToolResponseModalityLiteral = "tool-response" as const;

const ToolResponseContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ToolResponseModalityLiteral),
    index: z.number().int().nonnegative(),
    id: z.string().min(1),
    name: z.string().min(1),
    data: z.string(),
    apiResponse: z
      .object({
        statusCode: z.number().int().nonnegative(),
      })
      .optional(),
    metadata: Metadata,
  });
type ToolResponseContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ToolResponseContent<M>>>;

const PartialToolResponseModalityLiteral = "partial-tool-response" as const;

const PartialToolResponseContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialToolResponseModalityLiteral),
    index: z.number().int().nonnegative(),
    id: z.string().optional(),
    name: z.string().optional(),
    data: z.string().optional(),
    apiResponse: z
      .object({
        statusCode: z.number().int().nonnegative(),
      })
      .optional(),
    metadata: Metadata,
  });
type PartialToolResponseContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialToolResponseContent<M>>>;

export {
  PartialToolResponseContent,
  PartialToolResponseModalityLiteral,
  ToolResponseContent,
  ToolResponseModalityLiteral,
  type PartialToolResponseContentType,
  type ToolResponseContentType,
};
