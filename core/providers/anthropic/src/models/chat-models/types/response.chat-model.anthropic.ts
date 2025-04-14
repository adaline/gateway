import { z } from "zod";

const AnthropicCompleteChatTextResponse = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const AnthropicCompleteChatToolResponse = z.object({
  type: z.literal("tool_use"),
  id: z.string(),
  name: z.string(),
  input: z.record(z.any()),
});

const AnthropicCompleteChatThinkingResponse = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
  signature: z.string(),
});

const AnthropicCompleteChatRedactedThinkingResponse = z.object({
  type: z.literal("redacted_thinking"),
  data: z.string(),
});

const AnthropicCompleteChatResponse = z.object({
  content: z.array(
    z.discriminatedUnion("type", [
      AnthropicCompleteChatTextResponse,
      AnthropicCompleteChatToolResponse,
      AnthropicCompleteChatThinkingResponse,
      AnthropicCompleteChatRedactedThinkingResponse,
    ])
  ),
  id: z.string(),
  model: z.string(),
  role: z.string(),
  stop_reason: z.string(),
  stop_sequence: z.null(),
  type: z.literal("message"),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
    cache_creation_input_tokens: z.number().nullish(),
    cache_read_input_tokens: z.number().nullish(),
  }),
});
type AnthropicCompleteChatResponseType = z.infer<typeof AnthropicCompleteChatResponse>;

const AnthropicStreamChatMessageStartResponse = z.object({
  type: z.literal("message_start"),
  message: z.object({
    id: z.string(),
    type: z.literal("message"),
    role: z.string(),
    model: z.string(),
    stop_reason: z.string().nullable(),
    stop_sequence: z.string().nullable(),
    content: z.array(z.any()),
    usage: z.object({
      input_tokens: z.number(),
      output_tokens: z.number(),
    }),
  }),
});

const AnthropicStreamChatMessageDeltaResponse = z.object({
  type: z.literal("message_delta"),
  delta: z.object({
    stop_reason: z.string().nullable(),
    stop_sequence: z.string().nullable(),
  }),
  usage: z.object({
    output_tokens: z.number(),
  }),
});

const AnthropicStreamChatContentBlockStartTextResponse = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const AnthropicStreamChatContentBlockStartToolResponse = z.object({
  type: z.literal("tool_use"),
  id: z.string(),
  name: z.string(),
  input: z.object({}),
});

const AnthropicStreamChatContentBlockStartThinkingResponse = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
});

const AnthropicStreamChatContentBlockStartRedactedThinkingResponse = z.object({
  type: z.literal("redacted_thinking"),
  data: z.string(),
});

const AnthropicStreamChatContentBlockStartResponse = z.object({
  type: z.literal("content_block_start"),
  index: z.number(),
  content_block: z.discriminatedUnion("type", [
    AnthropicStreamChatContentBlockStartTextResponse,
    AnthropicStreamChatContentBlockStartToolResponse,
    AnthropicStreamChatContentBlockStartThinkingResponse,
    AnthropicStreamChatContentBlockStartRedactedThinkingResponse,
  ]),
});

const AnthropicStreamChatContentBlockDeltaTextResponse = z.object({
  type: z.literal("text_delta"),
  text: z.string(),
});

const AnthropicStreamChatContentBlockDeltaToolResponse = z.object({
  type: z.literal("input_json_delta"),
  partial_json: z.string(),
});

const AnthropicStreamChatContentBlockDeltaThinkingResponse = z.object({
  type: z.literal("thinking_delta"),
  thinking: z.string(),
});

const AnthropicStreamChatContentBlockDeltaSignatureResponse = z.object({
  type: z.literal("signature_delta"),
  signature: z.string(),
});

const AnthropicStreamChatContentBlockDeltaResponse = z.object({
  type: z.literal("content_block_delta"),
  index: z.number(),
  delta: z.discriminatedUnion("type", [
    AnthropicStreamChatContentBlockDeltaTextResponse,
    AnthropicStreamChatContentBlockDeltaToolResponse,
    AnthropicStreamChatContentBlockDeltaThinkingResponse,
    AnthropicStreamChatContentBlockDeltaSignatureResponse,
  ]),
});

// const AnthropicStreamChatResponse = z
//   .object({
//     type: z.string(),
//     index: z.number(),
//     delta: z.discriminatedUnion("type", [AnthropicStreamChatTextResponse, AnthropicStreamChatToolResponse]).optional(),
//     content_block: AnthropicStreamChatToolNameResponse.optional(),
//   })
//   .or(AnthropicStreamChatInitialResponse)
//   .or(AnthropicStreamChatLastResponse);

export {
  AnthropicCompleteChatResponse,
  AnthropicStreamChatContentBlockDeltaResponse,
  AnthropicStreamChatContentBlockStartResponse,
  AnthropicStreamChatMessageDeltaResponse,
  AnthropicStreamChatMessageStartResponse,
  type AnthropicCompleteChatResponseType,
};
