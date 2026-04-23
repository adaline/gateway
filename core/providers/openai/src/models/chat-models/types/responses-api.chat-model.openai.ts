import { z } from "zod";

// ─── Request: Content Parts ───────────────────────────────────────────────────

const OpenAIResponsesRequestInputTextContent = z.object({
  type: z.literal("input_text"),
  text: z.string(),
});
type OpenAIResponsesRequestInputTextContentType = z.infer<typeof OpenAIResponsesRequestInputTextContent>;

const OpenAIResponsesRequestInputImageContent = z.object({
  type: z.literal("input_image"),
  image_url: z.object({
    url: z.string(),
    detail: z.enum(["low", "high", "auto"]).optional(),
  }),
});
type OpenAIResponsesRequestInputImageContentType = z.infer<typeof OpenAIResponsesRequestInputImageContent>;

const OpenAIResponsesRequestInputFileContent = z.object({
  type: z.literal("input_file"),
  file_id: z.string().optional(),
  file_url: z.string().optional(),
  filename: z.string().optional(),
  file_data: z.string().optional(),
});
type OpenAIResponsesRequestInputFileContentType = z.infer<typeof OpenAIResponsesRequestInputFileContent>;

const OpenAIResponsesRequestOutputTextContent = z.object({
  type: z.literal("output_text"),
  text: z.string(),
});
type OpenAIResponsesRequestOutputTextContentType = z.infer<typeof OpenAIResponsesRequestOutputTextContent>;

const OpenAIResponsesRequestInputContentPart = z.union([
  OpenAIResponsesRequestInputTextContent,
  OpenAIResponsesRequestInputImageContent,
  OpenAIResponsesRequestInputFileContent,
]);
type OpenAIResponsesRequestInputContentPartType = z.infer<typeof OpenAIResponsesRequestInputContentPart>;

const OpenAIResponsesRequestOutputContentPart = OpenAIResponsesRequestOutputTextContent;
type OpenAIResponsesRequestOutputContentPartType = z.infer<typeof OpenAIResponsesRequestOutputContentPart>;

// ─── Request: Input Items ─────────────────────────────────────────────────────

const OpenAIResponsesRequestMessageItem = z.object({
  type: z.literal("message"),
  role: z.enum(["user", "assistant", "system", "developer"]),
  content: z.union([z.string(), z.array(OpenAIResponsesRequestInputContentPart), z.array(OpenAIResponsesRequestOutputContentPart)]),
});
type OpenAIResponsesRequestMessageItemType = z.infer<typeof OpenAIResponsesRequestMessageItem>;

const OpenAIResponsesRequestFunctionCallItem = z.object({
  type: z.literal("function_call"),
  call_id: z.string(),
  name: z.string(),
  arguments: z.string(),
});
type OpenAIResponsesRequestFunctionCallItemType = z.infer<typeof OpenAIResponsesRequestFunctionCallItem>;

const OpenAIResponsesRequestFunctionCallOutputItem = z.object({
  type: z.literal("function_call_output"),
  call_id: z.string(),
  output: z.string(),
});
type OpenAIResponsesRequestFunctionCallOutputItemType = z.infer<typeof OpenAIResponsesRequestFunctionCallOutputItem>;

const OpenAIResponsesRequestInputItem = z.discriminatedUnion("type", [
  OpenAIResponsesRequestMessageItem,
  OpenAIResponsesRequestFunctionCallItem,
  OpenAIResponsesRequestFunctionCallOutputItem,
]);
type OpenAIResponsesRequestInputItemType = z.infer<typeof OpenAIResponsesRequestInputItem>;

// ─── Request: Tools ───────────────────────────────────────────────────────────

// JSON Schema is a recursive structure with arbitrary keys; validated by the OpenAI server.
// Use a typed object record so callers get `Record<string, unknown>` instead of `any`.
const OpenAIJsonSchemaObject = z.record(z.string(), z.unknown());
type OpenAIJsonSchemaObjectType = z.infer<typeof OpenAIJsonSchemaObject>;

const OpenAIResponsesRequestFunctionTool = z.object({
  type: z.literal("function"),
  name: z.string(),
  description: z.string().optional(),
  parameters: OpenAIJsonSchemaObject,
  strict: z.boolean().optional(),
});
type OpenAIResponsesRequestFunctionToolType = z.infer<typeof OpenAIResponsesRequestFunctionTool>;

const OpenAIResponsesRequestWebSearchTool = z.object({
  type: z.literal("web_search"),
  filters: z
    .object({
      allowed_domains: z.array(z.string()).optional(),
    })
    .optional(),
  user_location: z
    .object({
      type: z.literal("approximate"),
      country: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  external_web_access: z.boolean().optional(),
});
type OpenAIResponsesRequestWebSearchToolType = z.infer<typeof OpenAIResponsesRequestWebSearchTool>;

const OpenAIResponsesRequestTool = z.discriminatedUnion("type", [OpenAIResponsesRequestFunctionTool, OpenAIResponsesRequestWebSearchTool]);
type OpenAIResponsesRequestToolType = z.infer<typeof OpenAIResponsesRequestTool>;

const OpenAIResponsesRequestToolChoice = z.union([
  z.enum(["none", "auto", "required"]),
  z.object({
    type: z.literal("function"),
    name: z.string(),
  }),
]);
type OpenAIResponsesRequestToolChoiceType = z.infer<typeof OpenAIResponsesRequestToolChoice>;

// ─── Request: Reasoning & Text Format ────────────────────────────────────────

const OpenAIResponsesRequestReasoning = z.object({
  effort: z.enum(["none", "minimal", "low", "medium", "high", "xhigh"]).optional(),
  summary: z.enum(["auto", "concise", "detailed"]).nullable().optional(),
});
type OpenAIResponsesRequestReasoningType = z.infer<typeof OpenAIResponsesRequestReasoning>;

const OpenAIResponsesRequestTextFormat = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text") }),
  z.object({
    type: z.literal("json_schema"),
    name: z.string(),
    description: z.string().optional(),
    schema: OpenAIJsonSchemaObject,
    strict: z.boolean().optional(),
  }),
  z.object({ type: z.literal("json_object") }),
]);
type OpenAIResponsesRequestTextFormatType = z.infer<typeof OpenAIResponsesRequestTextFormat>;

const OpenAIResponsesRequestText = z.object({
  format: OpenAIResponsesRequestTextFormat.optional(),
  verbosity: z.enum(["low", "medium", "high"]).optional(),
});
type OpenAIResponsesRequestTextType = z.infer<typeof OpenAIResponsesRequestText>;

// ─── Request: Full Envelope ───────────────────────────────────────────────────

const OpenAIResponsesRequest = z.object({
  model: z.string().optional(),
  input: z.union([z.string(), z.array(OpenAIResponsesRequestInputItem)]),
  instructions: z.string().nullable().optional(),
  max_output_tokens: z.number().min(0).nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  top_p: z.number().min(0).max(1).nullable().optional(),
  stream: z.boolean().optional(),
  store: z.boolean().optional(),
  parallel_tool_calls: z.boolean().optional(),
  metadata: z.record(z.string()).optional(),
  user: z.string().optional(),
  previous_response_id: z.string().nullable().optional(),
  tools: z.array(OpenAIResponsesRequestTool).optional(),
  tool_choice: OpenAIResponsesRequestToolChoice.optional(),
  reasoning: OpenAIResponsesRequestReasoning.optional(),
  text: OpenAIResponsesRequestText.optional(),
  truncation: z
    .object({
      type: z.enum(["auto", "disabled"]),
    })
    .optional(),
  include: z.array(z.string()).optional(),
});
type OpenAIResponsesRequestType = z.infer<typeof OpenAIResponsesRequest>;

// ─── Response: Output Content Parts ──────────────────────────────────────────

const OpenAIResponsesOutputTextAnnotation = z.object({
  type: z.literal("url_citation"),
  start_index: z.number(),
  end_index: z.number(),
  url: z.string(),
  title: z.string(),
});
type OpenAIResponsesOutputTextAnnotationType = z.infer<typeof OpenAIResponsesOutputTextAnnotation>;

// Per OpenAI docs: each logprob carries the token plus `top_logprobs` alternatives.
// Shape is identical to Chat Completions log-prob entries (token/logprob/bytes).
const OpenAIResponsesOutputTextLogProb = z.object({
  token: z.string(),
  logprob: z.number(),
  bytes: z.array(z.number()).nullable(),
  top_logprobs: z.array(
    z.object({
      token: z.string(),
      logprob: z.number(),
      bytes: z.array(z.number()).nullable(),
    })
  ),
});
type OpenAIResponsesOutputTextLogProbType = z.infer<typeof OpenAIResponsesOutputTextLogProb>;

const OpenAIResponsesOutputTextContentPart = z.object({
  type: z.literal("output_text"),
  text: z.string(),
  annotations: z.array(OpenAIResponsesOutputTextAnnotation).default([]),
  logprobs: z.array(OpenAIResponsesOutputTextLogProb).optional(),
});
type OpenAIResponsesOutputTextContentPartType = z.infer<typeof OpenAIResponsesOutputTextContentPart>;

const OpenAIResponsesOutputRefusalContentPart = z.object({
  type: z.literal("refusal"),
  refusal: z.string(),
});
type OpenAIResponsesOutputRefusalContentPartType = z.infer<typeof OpenAIResponsesOutputRefusalContentPart>;

const OpenAIResponsesOutputContentPart = z.discriminatedUnion("type", [
  OpenAIResponsesOutputTextContentPart,
  OpenAIResponsesOutputRefusalContentPart,
]);
type OpenAIResponsesOutputContentPartType = z.infer<typeof OpenAIResponsesOutputContentPart>;

// ─── Response: Output Items ───────────────────────────────────────────────────

const OpenAIResponsesOutputMessageItem = z.object({
  id: z.string(),
  type: z.literal("message"),
  role: z.literal("assistant"),
  status: z.string().optional(),
  content: z.array(OpenAIResponsesOutputContentPart),
});
type OpenAIResponsesOutputMessageItemType = z.infer<typeof OpenAIResponsesOutputMessageItem>;

const OpenAIResponsesOutputFunctionCallItem = z.object({
  id: z.string(),
  type: z.literal("function_call"),
  call_id: z.string(),
  name: z.string(),
  arguments: z.string(),
  status: z.string().optional(),
});
type OpenAIResponsesOutputFunctionCallItemType = z.infer<typeof OpenAIResponsesOutputFunctionCallItem>;

const OpenAIResponsesOutputWebSearchCallItem = z.object({
  id: z.string(),
  type: z.literal("web_search_call"),
  status: z.string().optional(),
  action: z
    .object({
      type: z.string(),
      query: z.string().optional(),
    })
    .optional(),
});
type OpenAIResponsesOutputWebSearchCallItemType = z.infer<typeof OpenAIResponsesOutputWebSearchCallItem>;

// Each summary part on a reasoning output item (and the matching streaming events)
// follows the OpenAI Responses API shape: {type: "summary_text", text: string}.
const OpenAIResponsesReasoningSummaryPart = z.object({
  type: z.literal("summary_text"),
  text: z.string(),
});
type OpenAIResponsesReasoningSummaryPartType = z.infer<typeof OpenAIResponsesReasoningSummaryPart>;

const OpenAIResponsesOutputReasoningItem = z.object({
  id: z.string(),
  type: z.literal("reasoning"),
  summary: z.array(OpenAIResponsesReasoningSummaryPart).optional(),
  status: z.string().nullable().optional(),
  encrypted_content: z.string().optional(),
});
type OpenAIResponsesOutputReasoningItemType = z.infer<typeof OpenAIResponsesOutputReasoningItem>;

// Per OpenAI docs, each file_search result carries the cited file + match metadata.
// Fields are all optional since OpenAI can omit any of them depending on the vector store configuration.
const OpenAIResponsesFileSearchResult = z.object({
  file_id: z.string().optional(),
  filename: z.string().optional(),
  score: z.number().optional(),
  text: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});
type OpenAIResponsesFileSearchResultType = z.infer<typeof OpenAIResponsesFileSearchResult>;

const OpenAIResponsesOutputFileSearchCallItem = z.object({
  id: z.string(),
  type: z.literal("file_search_call"),
  status: z.string().optional(),
  queries: z.array(z.string()).optional(),
  results: z.array(OpenAIResponsesFileSearchResult).optional(),
});
type OpenAIResponsesOutputFileSearchCallItemType = z.infer<typeof OpenAIResponsesOutputFileSearchCallItem>;

const OpenAIResponsesOutputItem = z.discriminatedUnion("type", [
  OpenAIResponsesOutputMessageItem,
  OpenAIResponsesOutputFunctionCallItem,
  OpenAIResponsesOutputWebSearchCallItem,
  OpenAIResponsesOutputReasoningItem,
  OpenAIResponsesOutputFileSearchCallItem,
]);
type OpenAIResponsesOutputItemType = z.infer<typeof OpenAIResponsesOutputItem>;

// ─── Response: Usage & Error ──────────────────────────────────────────────────

const OpenAIResponsesUsage = z.object({
  input_tokens: z.number(),
  input_tokens_details: z
    .object({
      cached_tokens: z.number().optional(),
    })
    .optional(),
  output_tokens: z.number(),
  output_tokens_details: z
    .object({
      reasoning_tokens: z.number().optional(),
    })
    .optional(),
  total_tokens: z.number(),
});
type OpenAIResponsesUsageType = z.infer<typeof OpenAIResponsesUsage>;

const OpenAIResponsesError = z.object({
  type: z.string(),
  code: z.string().nullable().optional(),
  message: z.string(),
  param: z.string().nullable().optional(),
});
type OpenAIResponsesErrorType = z.infer<typeof OpenAIResponsesError>;

// ─── Response: Complete Response ─────────────────────────────────────────────

const OpenAIResponsesCompleteResponse = z.object({
  id: z.string(),
  object: z.literal("response"),
  created_at: z.number().optional(),
  model: z.string(),
  status: z.enum(["queued", "in_progress", "completed", "failed", "incomplete", "cancelled"]),
  output: z.array(OpenAIResponsesOutputItem),
  output_text: z.string().optional(),
  usage: OpenAIResponsesUsage.optional(),
  error: OpenAIResponsesError.nullable().optional(),
  incomplete_details: z
    .object({
      reason: z.string().optional(),
    })
    .nullable()
    .optional(),
  metadata: z.record(z.string()).optional(),
  previous_response_id: z.string().nullable().optional(),
});
type OpenAIResponsesCompleteResponseType = z.infer<typeof OpenAIResponsesCompleteResponse>;

// ─── Streaming Events ─────────────────────────────────────────────────────────

// Lifecycle events — response.created / in_progress / queued carry a partial response
const OpenAIResponsesStreamEventResponseCreated = z.object({
  type: z.literal("response.created"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse.partial().passthrough(),
});

const OpenAIResponsesStreamEventResponseInProgress = z.object({
  type: z.literal("response.in_progress"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse.partial().passthrough(),
});

const OpenAIResponsesStreamEventResponseQueued = z.object({
  type: z.literal("response.queued"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse.partial().passthrough(),
});

const OpenAIResponsesStreamEventResponseCompleted = z.object({
  type: z.literal("response.completed"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse,
});

const OpenAIResponsesStreamEventResponseFailed = z.object({
  type: z.literal("response.failed"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse,
});

const OpenAIResponsesStreamEventResponseIncomplete = z.object({
  type: z.literal("response.incomplete"),
  sequence_number: z.number().optional(),
  response: OpenAIResponsesCompleteResponse,
});

// Output item lifecycle
const OpenAIResponsesStreamEventOutputItemAdded = z.object({
  type: z.literal("response.output_item.added"),
  sequence_number: z.number().optional(),
  output_index: z.number(),
  item: OpenAIResponsesOutputItem,
});

const OpenAIResponsesStreamEventOutputItemDone = z.object({
  type: z.literal("response.output_item.done"),
  sequence_number: z.number().optional(),
  output_index: z.number(),
  item: OpenAIResponsesOutputItem,
});

const OpenAIResponsesStreamEventContentPartAdded = z.object({
  type: z.literal("response.content_part.added"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  part: OpenAIResponsesOutputContentPart,
});

const OpenAIResponsesStreamEventContentPartDone = z.object({
  type: z.literal("response.content_part.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  part: OpenAIResponsesOutputContentPart,
});

// Text streaming
const OpenAIResponsesStreamEventOutputTextDelta = z.object({
  type: z.literal("response.output_text.delta"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  delta: z.string(),
});

const OpenAIResponsesStreamEventOutputTextDone = z.object({
  type: z.literal("response.output_text.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  text: z.string(),
});

const OpenAIResponsesStreamEventOutputTextAnnotationAdded = z.object({
  type: z.literal("response.output_text.annotation.added"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  annotation_index: z.number(),
  annotation: OpenAIResponsesOutputTextAnnotation,
});

// Refusal streaming
const OpenAIResponsesStreamEventRefusalDelta = z.object({
  type: z.literal("response.refusal.delta"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  delta: z.string(),
});

const OpenAIResponsesStreamEventRefusalDone = z.object({
  type: z.literal("response.refusal.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  content_index: z.number(),
  refusal: z.string(),
});

// Reasoning streaming
const OpenAIResponsesStreamEventReasoningSummaryPartAdded = z.object({
  type: z.literal("response.reasoning_summary_part.added"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  summary_index: z.number(),
  part: OpenAIResponsesReasoningSummaryPart,
});

const OpenAIResponsesStreamEventReasoningSummaryPartDone = z.object({
  type: z.literal("response.reasoning_summary_part.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  summary_index: z.number(),
  part: OpenAIResponsesReasoningSummaryPart,
});

const OpenAIResponsesStreamEventReasoningSummaryTextDelta = z.object({
  type: z.literal("response.reasoning_summary_text.delta"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  summary_index: z.number(),
  delta: z.string(),
});

const OpenAIResponsesStreamEventReasoningSummaryTextDone = z.object({
  type: z.literal("response.reasoning_summary_text.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  summary_index: z.number(),
  text: z.string(),
});

const OpenAIResponsesStreamEventReasoningTextDelta = z.object({
  type: z.literal("response.reasoning_text.delta"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  delta: z.string(),
});

const OpenAIResponsesStreamEventReasoningTextDone = z.object({
  type: z.literal("response.reasoning_text.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  text: z.string(),
});

// Function call argument streaming
const OpenAIResponsesStreamEventFunctionCallArgumentsDelta = z.object({
  type: z.literal("response.function_call_arguments.delta"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  delta: z.string(),
});

const OpenAIResponsesStreamEventFunctionCallArgumentsDone = z.object({
  type: z.literal("response.function_call_arguments.done"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
  arguments: z.string(),
});

// Web search lifecycle streaming
const OpenAIResponsesStreamEventWebSearchCallInProgress = z.object({
  type: z.literal("response.web_search_call.in_progress"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

const OpenAIResponsesStreamEventWebSearchCallSearching = z.object({
  type: z.literal("response.web_search_call.searching"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

const OpenAIResponsesStreamEventWebSearchCallCompleted = z.object({
  type: z.literal("response.web_search_call.completed"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

// File search lifecycle streaming
const OpenAIResponsesStreamEventFileSearchCallInProgress = z.object({
  type: z.literal("response.file_search_call.in_progress"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

const OpenAIResponsesStreamEventFileSearchCallSearching = z.object({
  type: z.literal("response.file_search_call.searching"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

const OpenAIResponsesStreamEventFileSearchCallCompleted = z.object({
  type: z.literal("response.file_search_call.completed"),
  sequence_number: z.number().optional(),
  item_id: z.string(),
  output_index: z.number(),
});

// Error event
const OpenAIResponsesStreamEventError = z.object({
  type: z.literal("error"),
  sequence_number: z.number().optional(),
  error: OpenAIResponsesError,
});

// ─── Streaming Event Discriminated Union ──────────────────────────────────────

const OpenAIResponsesStreamEvent = z.discriminatedUnion("type", [
  OpenAIResponsesStreamEventResponseCreated,
  OpenAIResponsesStreamEventResponseInProgress,
  OpenAIResponsesStreamEventResponseQueued,
  OpenAIResponsesStreamEventResponseCompleted,
  OpenAIResponsesStreamEventResponseFailed,
  OpenAIResponsesStreamEventResponseIncomplete,
  OpenAIResponsesStreamEventOutputItemAdded,
  OpenAIResponsesStreamEventOutputItemDone,
  OpenAIResponsesStreamEventContentPartAdded,
  OpenAIResponsesStreamEventContentPartDone,
  OpenAIResponsesStreamEventOutputTextDelta,
  OpenAIResponsesStreamEventOutputTextDone,
  OpenAIResponsesStreamEventOutputTextAnnotationAdded,
  OpenAIResponsesStreamEventRefusalDelta,
  OpenAIResponsesStreamEventRefusalDone,
  OpenAIResponsesStreamEventReasoningSummaryPartAdded,
  OpenAIResponsesStreamEventReasoningSummaryPartDone,
  OpenAIResponsesStreamEventReasoningSummaryTextDelta,
  OpenAIResponsesStreamEventReasoningSummaryTextDone,
  OpenAIResponsesStreamEventReasoningTextDelta,
  OpenAIResponsesStreamEventReasoningTextDone,
  OpenAIResponsesStreamEventFunctionCallArgumentsDelta,
  OpenAIResponsesStreamEventFunctionCallArgumentsDone,
  OpenAIResponsesStreamEventWebSearchCallInProgress,
  OpenAIResponsesStreamEventWebSearchCallSearching,
  OpenAIResponsesStreamEventWebSearchCallCompleted,
  OpenAIResponsesStreamEventFileSearchCallInProgress,
  OpenAIResponsesStreamEventFileSearchCallSearching,
  OpenAIResponsesStreamEventFileSearchCallCompleted,
  OpenAIResponsesStreamEventError,
]);
type OpenAIResponsesStreamEventType = z.infer<typeof OpenAIResponsesStreamEvent>;

export {
  OpenAIResponsesCompleteResponse,
  OpenAIResponsesError,
  OpenAIResponsesOutputContentPart,
  OpenAIResponsesOutputFileSearchCallItem,
  OpenAIResponsesOutputFunctionCallItem,
  OpenAIResponsesOutputItem,
  OpenAIResponsesOutputMessageItem,
  OpenAIResponsesOutputReasoningItem,
  OpenAIResponsesOutputRefusalContentPart,
  OpenAIResponsesOutputTextAnnotation,
  OpenAIResponsesOutputTextContentPart,
  OpenAIResponsesOutputWebSearchCallItem,
  OpenAIResponsesRequest,
  OpenAIResponsesRequestFunctionCallItem,
  OpenAIResponsesRequestFunctionCallOutputItem,
  OpenAIResponsesRequestFunctionTool,
  OpenAIResponsesRequestInputContentPart,
  OpenAIResponsesRequestInputFileContent,
  OpenAIResponsesRequestInputImageContent,
  OpenAIResponsesRequestInputItem,
  OpenAIResponsesRequestInputTextContent,
  OpenAIResponsesRequestMessageItem,
  OpenAIResponsesRequestOutputContentPart,
  OpenAIResponsesRequestOutputTextContent,
  OpenAIResponsesRequestReasoning,
  OpenAIResponsesRequestText,
  OpenAIResponsesRequestTextFormat,
  OpenAIResponsesRequestTool,
  OpenAIResponsesRequestToolChoice,
  OpenAIResponsesRequestWebSearchTool,
  OpenAIResponsesStreamEvent,
  OpenAIResponsesStreamEventContentPartAdded,
  OpenAIResponsesStreamEventContentPartDone,
  OpenAIResponsesStreamEventError,
  OpenAIResponsesStreamEventFileSearchCallCompleted,
  OpenAIResponsesStreamEventFileSearchCallInProgress,
  OpenAIResponsesStreamEventFileSearchCallSearching,
  OpenAIResponsesStreamEventFunctionCallArgumentsDelta,
  OpenAIResponsesStreamEventFunctionCallArgumentsDone,
  OpenAIResponsesStreamEventOutputItemAdded,
  OpenAIResponsesStreamEventOutputItemDone,
  OpenAIResponsesStreamEventOutputTextAnnotationAdded,
  OpenAIResponsesStreamEventOutputTextDelta,
  OpenAIResponsesStreamEventOutputTextDone,
  OpenAIResponsesStreamEventReasoningSummaryPartAdded,
  OpenAIResponsesStreamEventReasoningSummaryPartDone,
  OpenAIResponsesStreamEventReasoningSummaryTextDelta,
  OpenAIResponsesStreamEventReasoningSummaryTextDone,
  OpenAIResponsesStreamEventReasoningTextDelta,
  OpenAIResponsesStreamEventReasoningTextDone,
  OpenAIResponsesStreamEventRefusalDelta,
  OpenAIResponsesStreamEventRefusalDone,
  OpenAIResponsesStreamEventResponseCompleted,
  OpenAIResponsesStreamEventResponseCreated,
  OpenAIResponsesStreamEventResponseFailed,
  OpenAIResponsesStreamEventResponseIncomplete,
  OpenAIResponsesStreamEventResponseInProgress,
  OpenAIResponsesStreamEventResponseQueued,
  OpenAIResponsesStreamEventWebSearchCallCompleted,
  OpenAIResponsesStreamEventWebSearchCallInProgress,
  OpenAIResponsesStreamEventWebSearchCallSearching,
  OpenAIResponsesUsage,
  type OpenAIResponsesCompleteResponseType,
  type OpenAIResponsesErrorType,
  type OpenAIResponsesOutputContentPartType,
  type OpenAIResponsesOutputFileSearchCallItemType,
  type OpenAIResponsesOutputFunctionCallItemType,
  type OpenAIResponsesOutputItemType,
  type OpenAIResponsesOutputMessageItemType,
  type OpenAIResponsesOutputReasoningItemType,
  type OpenAIResponsesOutputRefusalContentPartType,
  type OpenAIResponsesOutputTextAnnotationType,
  type OpenAIResponsesOutputTextContentPartType,
  type OpenAIResponsesOutputWebSearchCallItemType,
  type OpenAIResponsesRequestFunctionCallItemType,
  type OpenAIResponsesRequestFunctionCallOutputItemType,
  type OpenAIResponsesRequestFunctionToolType,
  type OpenAIResponsesRequestInputContentPartType,
  type OpenAIResponsesRequestInputFileContentType,
  type OpenAIResponsesRequestInputImageContentType,
  type OpenAIResponsesRequestInputItemType,
  type OpenAIResponsesRequestInputTextContentType,
  type OpenAIResponsesRequestMessageItemType,
  type OpenAIResponsesRequestOutputContentPartType,
  type OpenAIResponsesRequestOutputTextContentType,
  type OpenAIResponsesRequestReasoningType,
  type OpenAIResponsesRequestTextFormatType,
  type OpenAIResponsesRequestTextType,
  type OpenAIResponsesRequestToolChoiceType,
  type OpenAIResponsesRequestToolType,
  type OpenAIResponsesRequestType,
  type OpenAIResponsesRequestWebSearchToolType,
  type OpenAIResponsesStreamEventType,
  type OpenAIResponsesUsageType,
};
