import { z } from "zod";

const SearchResultModalityLiteral = "search-result" as const;

const SearchResultGoogleTypeLiteral = "google" as const;

const SearchResultGoogleContentValue = z.object({
    type: z.literal(SearchResultGoogleTypeLiteral),
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
})
type SearchResultGoogleContentValueType = z.infer<typeof SearchResultGoogleContentValue>;

const SearchResultContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
    z.object({
        modality: z.literal(SearchResultModalityLiteral),
        value: z.discriminatedUnion("type", [SearchResultGoogleContentValue]),
        metadata: Metadata,
    });
type SearchResultContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof SearchResultContent<M>>>;

const PartialSearchResultModalityLiteral = "partial-search-result" as const;

const PartialSearchResultGoogleContentValue = z.object({
    type: z.literal(SearchResultGoogleTypeLiteral),
    query: z.string().optional(),
    responses: z.array(
        z.object({
            source: z.string().optional(),
            url: z.string().optional(),
            title: z.string().optional(),
            snippet: z.string().optional(),
        })
    ).optional(),
    references: z.array(
        z.object({
            text: z.string().optional(),
            responseIndices: z.array(z.number()).optional(),
            startIndex: z.number().optional(),
            endIndex: z.number().optional(),
            confidenceScores: z.array(z.number()).optional(),
        })
    ).optional(),
})
type PartialSearchResultGoogleContentValueType = z.infer<typeof PartialSearchResultGoogleContentValue>;

const PartialSearchResultContent = <M extends z.ZodTypeAny = z.ZodUndefined>(Metadata: M = z.undefined() as M) =>
    z.object({
        modality: z.literal(PartialSearchResultModalityLiteral),
        value: z.discriminatedUnion("type", [PartialSearchResultGoogleContentValue]),
        metadata: Metadata,
    });
type PartialSearchResultContentType<M extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof PartialSearchResultContent<M>>>;

export {
    PartialSearchResultModalityLiteral,
    PartialSearchResultContent,
    SearchResultModalityLiteral,
    SearchResultGoogleTypeLiteral,
    SearchResultGoogleContentValue,
    SearchResultContent,
    type SearchResultContentType,
    type SearchResultGoogleContentValueType,
    type PartialSearchResultContentType,
    type PartialSearchResultGoogleContentValueType,
};
