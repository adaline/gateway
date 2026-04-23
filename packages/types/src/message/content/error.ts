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

const ResponseErrorTypeLiteral = "response_error" as const;

const ResponseErrorContentValue = z.object({
  type: z.literal(ResponseErrorTypeLiteral),
  value: z.object({
    code: z.string(),
    message: z.string(),
    provider: z.string().optional(),
  }),
});
type ResponseErrorContentType = z.infer<typeof ResponseErrorContentValue>;

const ErrorContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ErrorModalityLiteral),
    value: z.discriminatedUnion("type", [SafetyErrorContentValue, ResponseErrorContentValue]),
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

const PartialResponseErrorContentValue = z.object({
  type: z.literal(ResponseErrorTypeLiteral),
  code: z.string().optional(),
  message: z.string().optional(),
  provider: z.string().optional(),
});
type PartialResponseErrorContentType = z.infer<typeof PartialResponseErrorContentValue>;

const PartialErrorContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialErrorModalityLiteral),
    value: z.discriminatedUnion("type", [PartialSafetyErrorContentValue, PartialResponseErrorContentValue]),
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
  ResponseErrorTypeLiteral,
  ResponseErrorContentValue,
  PartialResponseErrorContentValue,
  type SafetyErrorContentType,
  type PartialSafetyErrorContentType,
  type ResponseErrorContentType,
  type PartialResponseErrorContentType,
  type ErrorContentType,
  type PartialErrorContentType,
};
