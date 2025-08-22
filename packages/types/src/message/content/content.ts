import { z } from "zod";

import { ImageContent, ImageModalityLiteral } from "./image-content";
import { PdfContent, PdfModalityLiteral } from "./pdf-content";
import { PartialReasoningContent, PartialReasoningModalityLiteral, ReasoningContent, ReasoningModalityLiteral } from "./reasoning-content";
import { PartialTextContent, PartialTextModalityLiteral, TextContent, TextModalityLiteral } from "./text-content";
import { PartialToolCallContent, PartialToolCallModalityLiteral, ToolCallContent, ToolCallModalityLiteral } from "./tool-call-content";
import { PartialToolResponseContent, ToolResponseContent, ToolResponseModalityLiteral } from "./tool-response-content";

const ModalityLiterals = [
  TextModalityLiteral,
  ImageModalityLiteral,
  PdfModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ReasoningModalityLiteral,
] as const;
const ModalityEnum = z.enum(ModalityLiterals);
type ModalityEnumType = z.infer<typeof ModalityEnum>;

const Content = <
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  PCM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  TCCM extends z.ZodTypeAny = z.ZodUndefined,
>(
  TextContentMetadata: TCM = z.undefined() as TCM,
  ImageContentMetadata: ICM = z.undefined() as ICM,
  PdfContentMetadata: PCM = z.undefined() as PCM,
  ToolCallContentMetadata: CCM = z.undefined() as CCM,
  ToolResponseContentMetadata: RCM = z.undefined() as RCM,
  ReasoningContentMetadata: TCCM = z.undefined() as TCCM
) =>
  z.discriminatedUnion("modality", [
    TextContent(TextContentMetadata),
    ImageContent(ImageContentMetadata),
    PdfContent(PdfContentMetadata),
    ToolCallContent(ToolCallContentMetadata),
    ToolResponseContent(ToolResponseContentMetadata),
    ReasoningContent(ReasoningContentMetadata),
  ]);
type ContentType<
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof Content<TCM, ICM, CCM, RCM>>>;

const PartialModalityLiterals = [PartialTextModalityLiteral, PartialToolCallModalityLiteral, PartialReasoningModalityLiteral] as const;
const PartialModalityEnum = z.enum(PartialModalityLiterals);
type PartialModalityEnumType = z.infer<typeof PartialModalityEnum>;

const PartialContent = <
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  TPCM extends z.ZodTypeAny = z.ZodUndefined,
>(
  PartialTextContentMetadata: TCM = z.undefined() as TCM,
  PartialToolCallContentMetadata: CCM = z.undefined() as CCM,
  PartialReasoningContentMetadata: z.ZodTypeAny = z.undefined() as z.ZodTypeAny as RCM,
  PartialToolResponseContentMetadata: TPCM = z.undefined() as TPCM
) =>
  z.discriminatedUnion("modality", [
    PartialTextContent(PartialTextContentMetadata),
    PartialToolCallContent(PartialToolCallContentMetadata),
    PartialReasoningContent(PartialReasoningContentMetadata),
    PartialToolResponseContent(PartialToolResponseContentMetadata),
  ]);
type PartialContentType<
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  CCM extends z.ZodTypeAny = z.ZodUndefined,
  TPCM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof PartialContent<TCM, CCM, TPCM>>>;

export {
  Content,
  ModalityEnum,
  ModalityLiterals,
  PartialContent,
  PartialModalityEnum,
  PartialModalityLiterals,
  type ContentType,
  type ModalityEnumType,
  type PartialContentType,
  type PartialModalityEnumType,
};
