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
  thought: z.boolean().optional(),
});

const GoogleCompleteChatToolResponse = z.object({
  functionCall: z.object({
    name: z.string(),
    args: z.record(z.any()),
  }),
  thoughtSignature: z.string().optional(),
});

// Server-side built-in tool invocation (e.g. GOOGLE_SEARCH_WEB) emitted when
// tool_config.include_server_side_tool_invocations is enabled.
// Schema mirrors google.golang.org/genai ToolCall / ToolResponse:
//   toolType: TOOL_TYPE_UNSPECIFIED | GOOGLE_SEARCH_WEB | GOOGLE_SEARCH_IMAGE
//           | URL_CONTEXT | GOOGLE_MAPS | FILE_SEARCH
//   args / response: map[string]any keyed by toolType-specific shape
//   id: correlates toolCall → toolResponse
// z.string() on toolType (not z.enum) to stay forward-compat with new tools.
const GoogleCompleteChatServerSideToolCallResponse = z.object({
  toolCall: z.object({
    toolType: z.string(),
    args: z.record(z.unknown()),
    id: z.string(),
  }),
  thoughtSignature: z.string().optional(),
});

const GoogleCompleteChatServerSideToolResultResponse = z.object({
  toolResponse: z.object({
    toolType: z.string(),
    response: z.record(z.unknown()),
    id: z.string(),
  }),
  thoughtSignature: z.string().optional(),
});

const GoogleCompleteChatResponse = z.object({
  candidates: z.array(
    z.object({
      content: z
        .object({
          role: z.string(),
          parts: z.array(
            z.union([
              GoogleCompleteChatTextResponse,
              GoogleCompleteChatToolResponse,
              GoogleCompleteChatServerSideToolCallResponse,
              GoogleCompleteChatServerSideToolResultResponse,
            ])
          ),
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
  thought: z.boolean().optional(),
});

const GoogleStreamChatToolResponse = z.object({
  functionCall: z.object({
    name: z.string(),
    args: z.record(z.any()),
  }),
  thoughtSignature: z.string().optional(),
});

// Stream variant of the server-side built-in tool invocation parts. See
// GoogleCompleteChatServerSideToolCallResponse above for schema rationale.
const GoogleStreamChatServerSideToolCallResponse = z.object({
  toolCall: z.object({
    toolType: z.string(),
    args: z.record(z.unknown()),
    id: z.string(),
  }),
  thoughtSignature: z.string().optional(),
});

const GoogleStreamChatServerSideToolResultResponse = z.object({
  toolResponse: z.object({
    toolType: z.string(),
    response: z.record(z.unknown()),
    id: z.string(),
  }),
  thoughtSignature: z.string().optional(),
});

const GoogleStreamChatResponse = z.object({
  candidates: z.array(
    z.object({
      content: z
        .object({
          role: z.string(),
          parts: z.array(
            z.union([
              GoogleStreamChatTextResponse,
              GoogleStreamChatToolResponse,
              GoogleStreamChatServerSideToolCallResponse,
              GoogleStreamChatServerSideToolResultResponse,
            ])
          ),
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
  GoogleCompleteChatServerSideToolCallResponse,
  GoogleCompleteChatServerSideToolResultResponse,
  GoogleCompleteChatTextResponse,
  GoogleCompleteChatToolResponse,
  GoogleGroundingChunk,
  GoogleGroundingMetadata,
  GoogleGroundingSupport,
  GoogleSearchEntryPoint,
  GoogleStreamChatResponse,
  GoogleStreamChatServerSideToolCallResponse,
  GoogleStreamChatServerSideToolResultResponse,
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
