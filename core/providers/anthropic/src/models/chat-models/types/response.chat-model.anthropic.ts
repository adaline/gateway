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

const AnthropicCompleteChatResponse = z.object({
  content: z.array(z.discriminatedUnion("type", [AnthropicCompleteChatTextResponse, AnthropicCompleteChatToolResponse])),
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

const AnthropicStreamChatContentBlockStartResponse = z.object({
  type: z.literal("content_block_start"),
  index: z.number(),
  content_block: z.discriminatedUnion("type", [
    AnthropicStreamChatContentBlockStartTextResponse,
    AnthropicStreamChatContentBlockStartToolResponse,
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

const AnthropicStreamChatContentBlockDeltaResponse = z.object({
  type: z.literal("content_block_delta"),
  index: z.number(),
  delta: z.discriminatedUnion("type", [AnthropicStreamChatContentBlockDeltaTextResponse, AnthropicStreamChatContentBlockDeltaToolResponse]),
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
  AnthropicStreamChatMessageDeltaResponse,
  AnthropicStreamChatMessageStartResponse,
  AnthropicStreamChatContentBlockDeltaResponse,
  AnthropicStreamChatContentBlockStartResponse,
  type AnthropicCompleteChatResponseType,
};
