import { z } from "zod";

const XAIBaseLogProb = z.object({
  token: z.string(),
  logprob: z.number(),
  bytes: z.array(z.number()).nullable(),
});

const XAILogProb = z
  .object({
    content: z
      .array(
        XAIBaseLogProb.extend({
          top_logprobs: z.array(XAIBaseLogProb),
        })
      )
      .nullable()
      .optional(),
    refusal: z
      .array(
        XAIBaseLogProb.extend({
          top_logprobs: z.array(XAIBaseLogProb),
        })
      )
      .nullable()
      .optional(),
  })
  .nullable();

const XAIToolCallsCompleteChatResponse = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(["function"]),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })
);

const XAICompleteChatResponse = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullable().optional(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string().nullable().optional(),
        tool_calls: XAIToolCallsCompleteChatResponse.optional(),
        refusal: z.string().nullable().optional(),
      }),
      logprobs: XAILogProb.optional(),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    reasoning_tokens: z.number().optional(),
  }),
});
type XAICompleteChatResponseType = z.infer<typeof XAICompleteChatResponse>;

const XAIToolCallsStreamChatResponse = z.array(
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

const XAIStreamChatResponse = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullable().optional(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z
        .object({
          content: z.string().nullable().optional(),
          tool_calls: XAIToolCallsStreamChatResponse.optional(),
          refusal: z.string().nullable().optional(),
        })
        .or(z.object({})),
      logprobs: XAILogProb.optional(),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      reasoning_tokens: z.number().optional(),
    })
    .nullable()
    .optional(),
});
type XAIStreamChatResponseType = z.infer<typeof XAIStreamChatResponse>;

export {
  XAICompleteChatResponse,
  XAIStreamChatResponse,
  XAIToolCallsCompleteChatResponse,
  XAIToolCallsStreamChatResponse,
  type XAICompleteChatResponseType,
  type XAIStreamChatResponseType,
};
