import { z } from "zod";

const ErrorModalityLiteral = "error" as const;

const SafetyErrorTypeLiteral = "safety" as const;

const SafetyErrorContentValue = z.object({
    type: z.literal(SafetyErrorTypeLiteral),
    value: z.object({ 
      category: z.string(),
      probability: z.string(),
      blocked: z.boolean(),
      message: z.string(),
    }),
  });
type SafetyErrorContentType = z.infer<typeof SafetyErrorContentValue>;

const ErrorContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ErrorModalityLiteral),
    value: z.discriminatedUnion("type", [SafetyErrorContentValue]),
    metadata: Metadata,
  });
type ErrorContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ErrorContent<M>>>;

const PartialErrorModalityLiteral = "partial-error" as const;

const PartialSafetyErrorContentValue = z.object({
    type: z.literal(SafetyErrorTypeLiteral),
    category: z.string().optional(),
    probability: z.string().optional(),
    blocked: z.boolean().optional(),
    message: z.string().optional(),
  });
type PartialSafetyErrorContentType = z.infer<typeof PartialSafetyErrorContentValue>;

const PartialErrorContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialErrorModalityLiteral),
    value: z.discriminatedUnion("type", [PartialSafetyErrorContentValue]),
    metadata: Metadata,
  });
type PartialErrorContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialErrorContent<M>>>;

export {
  ErrorContent,
  PartialErrorContent,
  ErrorModalityLiteral,
  PartialErrorModalityLiteral,
  SafetyErrorTypeLiteral,
  SafetyErrorContentValue,
  type SafetyErrorContentType,
  type PartialSafetyErrorContentType,
  type ErrorContentType,
  type PartialErrorContentType,
};
