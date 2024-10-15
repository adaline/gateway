import { z } from "zod";

const OpenRouterBaseLogProb = z.object({
  token: z.string(),
  logprob: z.number(),
  bytes: z.array(z.number()).nullable(),
});

const OpenRouterLogProb = z
  .object({
    content: z
      .array(
        OpenRouterBaseLogProb.extend({
          top_logprobs: z.array(OpenRouterBaseLogProb),
        })
      )
      .nullable(),
    refusal: z
      .array(
        OpenRouterBaseLogProb.extend({
          top_logprobs: z.array(OpenRouterBaseLogProb),
        })
      )
      .nullable(),
  })
  .nullable();

const OpenRouterToolCallsCompleteChatResponse = z.array(
  z.object({
    id: z.string().min(1),
    type: z.enum(["function"]),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })
);

const OpenRouterCompleteChatResponse = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullable().optional(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string().nullable().optional(),
        tool_calls: OpenRouterToolCallsCompleteChatResponse.optional(),
        refusal: z.string().nullable().optional(),
      }),
      logprobs: OpenRouterLogProb.optional(),
      finish_reason: z.string().nullable().optional(),
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
type OpenRouterCompleteChatResponseType = z.infer<typeof OpenRouterCompleteChatResponse>;

const OpenRouterToolCallsStreamChatResponse = z.array(
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

const OpenRouterStreamChatResponse = z.object({
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
          tool_calls: OpenRouterToolCallsStreamChatResponse.optional(),
          refusal: z.string().nullable().optional(),
        })
        .or(z.object({})),
      logprobs: OpenRouterLogProb,
      finish_reason: z.string().nullable().optional(),
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
type OpenRouterStreamChatResponseType = z.infer<typeof OpenRouterStreamChatResponse>;

export {
  OpenRouterStreamChatResponse,
  OpenRouterCompleteChatResponse,
  OpenRouterToolCallsStreamChatResponse,
  OpenRouterToolCallsCompleteChatResponse,
  type OpenRouterStreamChatResponseType,
  type OpenRouterCompleteChatResponseType,
};
