import { z } from "zod";

const ReasoningModalityLiteral = "reasoning" as const;
const PartialReasoningModalityLiteral = "partial-reasoning" as const;

const ReasoningContentTypeLiteral = "thinking" as const;
const RedactedReasoningContentTypeLiteral = "redacted" as const;

const ReasoningContentValue = z.object({
  type: z.literal(ReasoningContentTypeLiteral),
  thinking: z.string(),
  signature: z.string(),
});
type ReasoningContentValueType = z.infer<typeof ReasoningContentValue>;

const RedactedReasoningContentValue = z.object({
  type: z.literal(RedactedReasoningContentTypeLiteral),
  data: z.string()
});
type RedactedReasoningContentValueType = z.infer<typeof RedactedReasoningContentValue>;

const ReasoningContentValueUnion = z.discriminatedUnion("type", [ ReasoningContentValue, RedactedReasoningContentValue ]);
type ReasoningContentValueUnionType = z.infer<typeof ReasoningContentValueUnion>;

const ReasoningContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ReasoningModalityLiteral),
    value: ReasoningContentValueUnion,
    metadata: Metadata,
  });

type ReasoningContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ReasoningContent<M>>>;

const PartialReasoningContentValue = z.object({
  type: z.literal(ReasoningContentTypeLiteral),
  thinking: ReasoningContentValue.shape.thinking.optional(),
  signature: ReasoningContentValue.shape.signature.optional(),
});
const PartialReasoningContentValueUnion = z.discriminatedUnion("type", [ 
  PartialReasoningContentValue, 
  RedactedReasoningContentValue 
]);

const PartialReasoningContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialReasoningModalityLiteral),
    value: PartialReasoningContentValueUnion,
    metadata: Metadata,
  });
type PartialReasoningContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialReasoningContent<M>>>;

export {
  ReasoningContent,
  PartialReasoningContent,
  PartialReasoningModalityLiteral,
  ReasoningContentTypeLiteral,
  ReasoningContentValue,
  PartialReasoningContentValue,
  ReasoningContentValueUnion,
  PartialReasoningContentValueUnion,
  ReasoningModalityLiteral,
  RedactedReasoningContentTypeLiteral,
  RedactedReasoningContentValue,
  type PartialReasoningContentType,
  type ReasoningContentType,
  type ReasoningContentValueType,
  type ReasoningContentValueUnionType,
  type RedactedReasoningContentValueType,
};
