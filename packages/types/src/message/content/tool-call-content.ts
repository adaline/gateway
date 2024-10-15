import { z } from "zod";

const ToolCallModalityLiteral = "tool-call" as const;

const ToolCallContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ToolCallModalityLiteral),
    index: z.number().int().nonnegative(),
    id: z.string().min(1),
    name: z.string().min(1),
    arguments: z.string(),
    metadata: Metadata,
  });
type ToolCallContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ToolCallContent<M>>>;

const PartialToolCallModalityLiteral = "partial-tool-call" as const;

// const PartialToolCallContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
//   ToolCallContent(Metadata).partial({
//     id: true,
//     name: true,
//     arguments: true,
//   }).merge(z.object({
//     modality: z.literal(PartialToolCallModalityLiteral),
//   }));
const PartialToolCallContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialToolCallModalityLiteral),
    index: z.number().int().nonnegative(),
    id: z.string().optional(),
    name: z.string().optional(),
    arguments: z.string().optional(),
    metadata: Metadata,
  });
type PartialToolCallContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialToolCallContent<M>>>;

export {
  ToolCallContent,
  PartialToolCallContent,
  ToolCallModalityLiteral,
  PartialToolCallModalityLiteral,
  type ToolCallContentType,
  type PartialToolCallContentType,
};
