import { z } from "zod";

const ImageModalityLiteral = "image" as const;

const Base64ImageContentTypeLiteral = "base64" as const;
const Base64ImageContentMediaTypeLiterals = ["png", "jpeg", "webp", "gif"] as const;
const Base64ImageContentValue = z.object({
  type: z.literal(Base64ImageContentTypeLiteral),
  base64: z.string(),
  media_type: z.enum(Base64ImageContentMediaTypeLiterals),
});
type Base64ImageContentValueType = z.infer<typeof Base64ImageContentValue>;

const UrlImageContentTypeLiteral = "url" as const;
const UrlImageContentValue = z.object({
  type: z.literal(UrlImageContentTypeLiteral),
  url: z.string(),
});
type UrlImageContentValueType = z.infer<typeof UrlImageContentValue>;

const ImageContentValue = z.discriminatedUnion("type", [Base64ImageContentValue, UrlImageContentValue]);
type ImageContentValueType = z.infer<typeof ImageContentValue>;

const ImageContentDetails = ["low", "medium", "high", "auto"] as const;
const ImageContentDetailsLiteral = z.enum(ImageContentDetails);
type ImageContentDetailsLiteralType = z.infer<typeof ImageContentDetailsLiteral>;
const ImageContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(ImageModalityLiteral),
    detail: ImageContentDetailsLiteral,
    value: ImageContentValue,
    metadata: Metadata,
  });
type ImageContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof ImageContent<M>>>;

export {
  Base64ImageContentValue,
  ImageContent,
  ImageContentDetails,
  ImageContentDetailsLiteral,
  ImageModalityLiteral,
  UrlImageContentValue,
  UrlImageContentTypeLiteral,
  Base64ImageContentTypeLiteral,
  Base64ImageContentMediaTypeLiterals,
  type Base64ImageContentValueType,
  type ImageContentDetailsLiteralType,
  type ImageContentType,
  type ImageContentValueType,
  type UrlImageContentValueType,
};
