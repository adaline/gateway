import { z } from "zod";

const PdfModalityLiteral = "pdf" as const;

const Base64PdfContentTypeLiteral = "base64" as const;
const Base64PdfContentValue = z.object({
  type: z.literal(Base64PdfContentTypeLiteral),
  base64: z.string(),
});
type Base64PdfContentValueType = z.infer<typeof Base64PdfContentValue>;

const UrlPdfContentTypeLiteral = "url" as const;
const UrlPdfContentValue = z.object({
  type: z.literal(UrlPdfContentTypeLiteral),
  url: z.string(),
});
type UrlPdfContentValueType = z.infer<typeof UrlPdfContentValue>;

const PdfContentValue = z.discriminatedUnion("type", [Base64PdfContentValue, UrlPdfContentValue]);
type PdfContentValueType = z.infer<typeof PdfContentValue>;

const PdfContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PdfModalityLiteral),
    value: PdfContentValue,
    metadata: Metadata,
  });
type PdfContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PdfContent<M>>>;

export {
  Base64PdfContentValue,
  PdfContent,
  PdfModalityLiteral,
  UrlPdfContentValue,
  UrlPdfContentTypeLiteral,
  Base64PdfContentTypeLiteral,
  type Base64PdfContentValueType,
  type PdfContentType,
  type PdfContentValueType,
  type UrlPdfContentValueType,
};
