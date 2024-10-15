import { z } from "zod";

const OpenAIBaseLogProb = z.object({
  token: z.string(),
  logprob: z.number(),
  bytes: z.array(z.number()).nullable(),
});

const OpenAILogProb = z
  .object({
    content: z
      .array(
        OpenAIBaseLogProb.extend({
          top_logprobs: z.array(OpenAIBaseLogProb),
        })
      )
      .nullable()
      .optional(),
    refusal: z
      .array(
        OpenAIBaseLogProb.extend({
          top_logprobs: z.array(OpenAIBaseLogProb),
        })
      )
      .nullable()
      .optional(),
  })
  .nullable();

const OpenAIToolCallsCompleteChatResponse = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(["function"]),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })
);

const OpenAICompleteChatResponse = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullable(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string().nullable().optional(),
        tool_calls: OpenAIToolCallsCompleteChatResponse.optional(),
        refusal: z.string().nullable().optional(),
      }),
      logprobs: OpenAILogProb.optional(),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});
type OpenAICompleteChatResponseType = z.infer<typeof OpenAICompleteChatResponse>;

const OpenAIToolCallsStreamChatResponse = z.array(
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

const OpenAIStreamChatResponse = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullable(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z
        .object({
          content: z.string().nullable().optional(),
          tool_calls: OpenAIToolCallsStreamChatResponse.optional(),
          refusal: z.string().nullable().optional(),
        })
        .or(z.object({})),
      logprobs: OpenAILogProb,
      finish_reason: z.string().nullable(),
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
type OpenAIStreamChatResponseType = z.infer<typeof OpenAIStreamChatResponse>;

export {
  OpenAIStreamChatResponse,
  OpenAICompleteChatResponse,
  OpenAIToolCallsStreamChatResponse,
  OpenAIToolCallsCompleteChatResponse,
  type OpenAIStreamChatResponseType,
  type OpenAICompleteChatResponseType,
};
