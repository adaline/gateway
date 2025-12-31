import { z } from "zod";

import { ErrorContent, ErrorModalityLiteral, PartialErrorContent, PartialErrorModalityLiteral } from "./error";
import { ImageContent, ImageModalityLiteral } from "./image-content";
import { PdfContent, PdfModalityLiteral } from "./pdf-content";
import { PartialReasoningContent, PartialReasoningModalityLiteral, ReasoningContent, ReasoningModalityLiteral } from "./reasoning-content";
import { PartialSearchResultContent, PartialSearchResultModalityLiteral, SearchResultContent, SearchResultModalityLiteral } from "./search-result";
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
  ErrorModalityLiteral,
  SearchResultModalityLiteral,
] as const;
const ModalityEnum = z.enum(ModalityLiterals);
type ModalityEnumType = z.infer<typeof ModalityEnum>;

const Content = <
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  PCM extends z.ZodTypeAny = z.ZodUndefined,
  TCCM extends z.ZodTypeAny = z.ZodUndefined,
  TRCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  ECM extends z.ZodTypeAny = z.ZodUndefined,
  SRCM extends z.ZodTypeAny = z.ZodUndefined,
>(
  TextContentMetadata: TCM = z.undefined() as TCM,
  ImageContentMetadata: ICM = z.undefined() as ICM,
  PdfContentMetadata: PCM = z.undefined() as PCM,
  ToolCallContentMetadata: TCCM = z.undefined() as TCCM,
  ToolResponseContentMetadata: TRCM = z.undefined() as TRCM,
  ReasoningContentMetadata: RCM = z.undefined() as RCM,
  ErrorContentMetadata: ECM = z.undefined() as ECM,
  SearchResultContentMetadata: SRCM = z.undefined() as SRCM
) =>
  z.discriminatedUnion("modality", [
    TextContent(TextContentMetadata),
    ImageContent(ImageContentMetadata),
    PdfContent(PdfContentMetadata),
    ToolCallContent(ToolCallContentMetadata),
    ToolResponseContent(ToolResponseContentMetadata),
    ReasoningContent(ReasoningContentMetadata),
    ErrorContent(ErrorContentMetadata),
    SearchResultContent(SearchResultContentMetadata),
  ]);
type ContentType<
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  ICM extends z.ZodTypeAny = z.ZodUndefined,
  PCM extends z.ZodTypeAny = z.ZodUndefined,
  TCCM extends z.ZodTypeAny = z.ZodUndefined,
  TRCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  ECM extends z.ZodTypeAny = z.ZodUndefined,
  SRCM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof Content<TCM, ICM, PCM, TCCM, TRCM, RCM, ECM, SRCM>>>;

const PartialModalityLiterals = [PartialTextModalityLiteral, PartialToolCallModalityLiteral, PartialReasoningModalityLiteral, PartialErrorModalityLiteral, PartialSearchResultModalityLiteral] as const;
const PartialModalityEnum = z.enum(PartialModalityLiterals);
type PartialModalityEnumType = z.infer<typeof PartialModalityEnum>;

const PartialContent = <
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  TCCM extends z.ZodTypeAny = z.ZodUndefined,
  TRCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  ECM extends z.ZodTypeAny = z.ZodUndefined,
  SRCM extends z.ZodTypeAny = z.ZodUndefined,
>(
  PartialTextContentMetadata: TCM = z.undefined() as TCM,
  PartialToolCallContentMetadata: TCCM = z.undefined() as TCCM,
  PartialToolResponseContentMetadata: TRCM = z.undefined() as TRCM,
  PartialReasoningContentMetadata: RCM = z.undefined() as RCM,
  PartialErrorContentMetadata: ECM = z.undefined() as ECM,
  PartialSearchResultContentMetadata: SRCM = z.undefined() as SRCM,
) =>
  z.discriminatedUnion("modality", [
    PartialTextContent(PartialTextContentMetadata),
    PartialToolCallContent(PartialToolCallContentMetadata),
    PartialReasoningContent(PartialReasoningContentMetadata),
    PartialToolResponseContent(PartialToolResponseContentMetadata),
    PartialErrorContent(PartialErrorContentMetadata),
    PartialSearchResultContent(PartialSearchResultContentMetadata),
  ]);
type PartialContentType<
  TCM extends z.ZodTypeAny = z.ZodUndefined,
  TCCM extends z.ZodTypeAny = z.ZodUndefined,
  TRCM extends z.ZodTypeAny = z.ZodUndefined,
  RCM extends z.ZodTypeAny = z.ZodUndefined,
  ECM extends z.ZodTypeAny = z.ZodUndefined,
  SRCM extends z.ZodTypeAny = z.ZodUndefined,
> = z.infer<ReturnType<typeof PartialContent<TCM, TCCM, TRCM, RCM, ECM, SRCM>>>;

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
