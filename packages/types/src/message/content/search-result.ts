import { z } from "zod";

const SearchResultModalityLiteral = "search-result" as const;

const SearchResultContentValue = z.object({
  type: z.string().optional(),
  query: z.string(),
  responses: z.array(
    z.object({
      source: z.string(),
      url: z.string(),
      title: z.string(),
      snippet: z.string().optional(),
    })
  ),
  references: z.array(
    z.object({
      text: z.string(),
      responseIndices: z.array(z.number()),
      startIndex: z.number().optional(),
      endIndex: z.number().optional(),
      confidenceScores: z.array(z.number()).optional(),
    })
  ),
});
type SearchResultContentValueType = z.infer<typeof SearchResultContentValue>;

const SearchResultContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(SearchResultModalityLiteral),
    value: SearchResultContentValue,
    metadata: Metadata,
  });
type SearchResultContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof SearchResultContent<M>>>;

const PartialSearchResultModalityLiteral = "partial-search-result" as const;

const PartialSearchResultContentValue = z.object({
  type: z.string().optional(),
  query: z.string().optional(),
  responses: z
    .array(
      z.object({
        source: z.string().optional(),
        url: z.string().optional(),
        title: z.string().optional(),
        snippet: z.string().optional(),
      })
    )
    .optional(),
  references: z
    .array(
      z.object({
        text: z.string().optional(),
        responseIndices: z.array(z.number()).optional(),
        startIndex: z.number().optional(),
        endIndex: z.number().optional(),
        confidenceScores: z.array(z.number()).optional(),
      })
    )
    .optional(),
});
type PartialSearchResultContentValueType = z.infer<typeof PartialSearchResultContentValue>;

const PartialSearchResultContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
  z.object({
    modality: z.literal(PartialSearchResultModalityLiteral),
    value: PartialSearchResultContentValue,
    metadata: Metadata,
  });
type PartialSearchResultContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialSearchResultContent<M>>>;

export {
  PartialSearchResultModalityLiteral,
  PartialSearchResultContent,
  PartialSearchResultContentValue,
  SearchResultModalityLiteral,
  SearchResultContent,
  SearchResultContentValue,
  type SearchResultContentType,
  type SearchResultContentValueType,
  type PartialSearchResultContentType,
  type PartialSearchResultContentValueType,
};
