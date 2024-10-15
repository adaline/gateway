import { z } from "zod";

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
      candidatesTokenCount: z.number(),
      totalTokenCount: z.number(),
    })
    .optional(),
});
type GoogleStreamChatResponseType = z.infer<typeof GoogleStreamChatResponse>;

export {
  GoogleCompleteChatResponse,
  GoogleCompleteChatTextResponse,
  GoogleCompleteChatToolResponse,
  GoogleStreamChatResponse,
  GoogleStreamChatTextResponse,
  GoogleStreamChatToolResponse,
  type GoogleStreamChatResponseType,
  type GoogleCompleteChatResponseType,
};
