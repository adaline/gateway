import { z } from "zod";

// Modality literals
const ReasoningModalityLiteral = "reasoning" as const;
const PartialReasoningModalityLiteral = "partial-reasoning" as const;

// Discriminators
const ReasoningContentTypeLiteral = "thinking" as const;
const RedactedReasoningContentTypeLiteral = "redacted" as const;

// Value schemas
const ReasoningContentValue = z.object({
  type: z.literal(ReasoningContentTypeLiteral),
  thinking: z.string().optional(), // Actual content
  signature: z.string().optional(), // Signature for validation
});
type ReasoningContentValueType = z.infer<typeof ReasoningContentValue>;

const RedactedReasoningContentValue = z.object({
  type: z.literal(RedactedReasoningContentTypeLiteral),
  data: z.string(), // Redacted content
});
type RedactedReasoningContentValueType = z.infer<typeof RedactedReasoningContentValue>;

// Union on `type`
const ReasoningContentValueUnion = z.discriminatedUnion("type", [ReasoningContentValue, RedactedReasoningContentValue]);
type ReasoningContentValueUnionType = z.infer<typeof ReasoningContentValueUnion>;

// Wrapper including modality + metadata
const ReasoningContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ReasoningModalityLiteral),
    value: ReasoningContentValueUnion,
    metadata: Metadata,
  });

type ReasoningContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ReasoningContent<M>>>;

// Partial reasoning content, following a similar pattern as for text content
const PartialReasoningContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialReasoningModalityLiteral),
    value: ReasoningContentValueUnion,
    metadata: Metadata,
  });
type PartialReasoningContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialReasoningContent<M>>>;

export {
  PartialReasoningContent,
  PartialReasoningModalityLiteral,
  ReasoningContent,
  ReasoningContentTypeLiteral,
  ReasoningContentValue,
  ReasoningContentValueUnion,
  ReasoningModalityLiteral,
  RedactedReasoningContentTypeLiteral,
  RedactedReasoningContentValue,
  type PartialReasoningContentType,
  type ReasoningContentType,
  type ReasoningContentValueType,
  type ReasoningContentValueUnionType,
  type RedactedReasoningContentValueType,
};
