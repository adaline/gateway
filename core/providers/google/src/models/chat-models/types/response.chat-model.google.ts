import { z } from "zod";

const GoogleSearchEntryPoint = z.object({
  renderedContent: z.string().optional(),
});
type GoogleSearchEntryPointType = z.infer<typeof GoogleSearchEntryPoint>;

const GoogleGroundingChunkWeb = z.object({
  uri: z.string().optional(),
  title: z.string().optional(),
});
type GoogleGroundingChunkWebType = z.infer<typeof GoogleGroundingChunkWeb>;

const GoogleGroundingChunk = z.object({
  web: GoogleGroundingChunkWeb.optional(),
});
type GoogleGroundingChunkType = z.infer<typeof GoogleGroundingChunk>;

const GoogleSegment = z.object({
  startIndex: z.number().optional(),
  endIndex: z.number().optional(),
  text: z.string().optional(),
});
type GoogleSegmentType = z.infer<typeof GoogleSegment>;

const GoogleGroundingSupport = z.object({
  segment: GoogleSegment.optional(),
  groundingChunkIndices: z.array(z.number()).optional(),
  confidenceScores: z.array(z.number()).optional(),
});
type GoogleGroundingSupportType = z.infer<typeof GoogleGroundingSupport>;

const GoogleGroundingMetadata = z.object({
  searchEntryPoint: GoogleSearchEntryPoint.optional(),
  groundingChunks: z.array(GoogleGroundingChunk).optional(),
  groundingSupports: z.array(GoogleGroundingSupport).optional(),
  webSearchQueries: z.array(z.string()).optional(),
});
type GoogleGroundingMetadataType = z.infer<typeof GoogleGroundingMetadata>;

const GoogleCompleteChatTextResponse = z.object({
  text: z.string(),
});

const GoogleCompleteChatToolResponse = z.object({
  functionCall: z.object({
    name: z.string(),
    args: z.record(z.any()),
  }),
});

const GoogleCompleteChatResponse = z.object({
  candidates: z.array(
    z.object({
      content: z
        .object({
          role: z.string(),
          parts: z.array(z.union([GoogleCompleteChatTextResponse, GoogleCompleteChatToolResponse])),
        })
        .optional(),
      finishReason: z.string(),
      index: z.number().optional(),
      safetyRatings: z.optional(
        z.array(
          z.object({
            category: z.string(),
            probability: z.string(),
            blocked: z.boolean().optional(),
          })
        )
      ),
      groundingMetadata: GoogleGroundingMetadata.optional(),
    })
  ),
  promptFeedback: z.optional(
    z.object({
      safetyRatings: z.optional(
        z.array(
          z.object({
            category: z.string(),
            probability: z.string(),
          })
        )
      ),
    })
  ),
  usageMetadata: z
    .object({
      promptTokenCount: z.number(),
      cachedContentTokenCount: z.number().optional(),
      candidatesTokenCount: z.number().optional(),
      totalTokenCount: z.number(),
    })
    .optional(),
});
type GoogleCompleteChatResponseType = z.infer<typeof GoogleCompleteChatResponse>;

const GoogleStreamChatTextResponse = z.object({
  text: z.string(),
});

const GoogleStreamChatToolResponse = z.object({
  functionCall: z.object({
    name: z.string(),
    args: z.record(z.any()),
  }),
});

const GoogleStreamChatResponse = z.object({
  candidates: z.array(
    z.object({
      content: z
        .object({
          role: z.string(),
          parts: z.array(z.union([GoogleStreamChatTextResponse, GoogleStreamChatToolResponse])),
        })
        .optional(),
      finishReason: z.string().optional(),
      index: z.number().optional(),
      safetyRatings: z.optional(
        z.array(
          z.object({
            category: z.string(),
            probability: z.string(),
            blocked: z.boolean().optional(),
          })
        )
      ),
      groundingMetadata: GoogleGroundingMetadata.optional(),
    })
  ),
  promptFeedback: z.optional(
    z.object({
      safetyRatings: z.optional(
        z.array(
          z.object({
            category: z.string(),
            probability: z.string(),
          })
        )
      ),
    })
  ),
  usageMetadata: z
    .object({
      promptTokenCount: z.number().optional(),
      cachedContentTokenCount: z.number().optional(),
      candidatesTokenCount: z.number().optional(),
      totalTokenCount: z.number().optional(),
    })
    .optional(),
});
type GoogleStreamChatResponseType = z.infer<typeof GoogleStreamChatResponse>;


export {
  GoogleCompleteChatResponse,
  GoogleCompleteChatTextResponse,
  GoogleCompleteChatToolResponse,
  GoogleGroundingChunk,
  GoogleGroundingMetadata,
  GoogleGroundingSupport,
  GoogleSearchEntryPoint,
  GoogleStreamChatResponse,
  GoogleStreamChatTextResponse,
  GoogleStreamChatToolResponse,
  type GoogleCompleteChatResponseType,
  type GoogleGroundingChunkType,
  type GoogleGroundingMetadataType,
  type GoogleGroundingSupportType,
  type GoogleSearchEntryPointType,
  type GoogleStreamChatResponseType,
  type GoogleGroundingChunkWebType,
  type GoogleSegmentType,
};
