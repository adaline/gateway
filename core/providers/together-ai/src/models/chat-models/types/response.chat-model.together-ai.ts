import { z } from "zod";

const TogetherAILogProbs = z.object({
  token_ids: z.array(z.number()),
  tokens: z.array(z.string()),
  token_logprobs: z.array(z.number()),
});

const TogetherAIToolCallsCompleteChatResponse = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(["function"]),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })
);

const TogetherAICompleteChatResponse = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  prompt: z.any(), // can be stricter but we don't maintain our own original prompt
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string().nullable().optional(),
        tool_calls: TogetherAIToolCallsCompleteChatResponse.optional(),
      }),
      logprobs: TogetherAILogProbs.nullable().optional(),
      seed: z.number().nullable().optional(),
      finish_reason: z.string(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullable()
    .optional(),
});
type TogetherAICompleteChatResponseType = z.infer<typeof TogetherAICompleteChatResponse>;

const TogetherAIToolCallsStreamChatResponse = z.array(
  z.object({
    index: z.number().int(),
    id: z.string().min(1).optional(),
    type: z.enum(["function"]).optional(),
    function: z
      .object({
        name: z.string().min(1).optional(),
        arguments: z.string().optional(),
      })
      .optional(),
  })
);

const TogetherAIStreamChatResponse = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z
        .object({
          token_id: z.number().nullable().optional(),
          role: z.string().nullable().optional(),
          content: z.string().nullable().optional(),
          tool_calls: TogetherAIToolCallsStreamChatResponse.optional(),
        })
        .or(z.object({})),
      logprobs: z.any().nullable().optional(), // logprobs not supported in streaming
      seed: z.number().nullable().optional(),
      finish_reason: z.string().nullable(),
      text: z.string().nullable().optional(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullable()
    .optional(),
});
type TogetherAIStreamChatResponseType = z.infer<typeof TogetherAIStreamChatResponse>;

export {
  TogetherAIStreamChatResponse,
  TogetherAICompleteChatResponse,
  TogetherAIToolCallsStreamChatResponse,
  TogetherAIToolCallsCompleteChatResponse,
  type TogetherAIStreamChatResponseType,
  type TogetherAICompleteChatResponseType,
};
