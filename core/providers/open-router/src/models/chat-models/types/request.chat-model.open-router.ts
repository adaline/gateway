import { z } from "zod";

const OpenRouterChatRequestTool = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    strict: z.boolean().optional(),
    parameters: z.any(),
  }),
});
type OpenRouterChatRequestToolType = z.infer<typeof OpenRouterChatRequestTool>;

const OpenRouterChatRequestToolChoiceEnum = z.enum(["none", "auto", "required"]);
type OpenRouterChatRequestToolChoiceEnumType = z.infer<typeof OpenRouterChatRequestToolChoiceEnum>;

const OpenRouterChatRequestToolChoiceFunction = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
  }),
});
type OpenRouterChatRequestToolChoiceFunctionType = z.infer<typeof OpenRouterChatRequestToolChoiceFunction>;

const OpenRouterChatRequestResponseFormat = z
  .object({
    type: z.enum(["text", "json_object"]),
  })
  .or(
    z.object({
      type: z.literal("json_schema"),
      json_schema: z.object({
        name: z.string().min(1),
        description: z.string().min(1).optional(),
        strict: z.boolean().optional(),
        schema: z.any(),
      }),
    })
  );
type OpenRouterChatRequestResponseFormatType = z.infer<typeof OpenRouterChatRequestResponseFormat>;

const OpenRouterChatRequestTextContent = z.object({
  text: z.string().min(1),
  type: z.literal("text"),
});
type OpenRouterChatRequestTextContentType = z.infer<typeof OpenRouterChatRequestTextContent>;

const OpenRouterChatRequestImageContent = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string().url().min(1),
    detail: z.enum(["low", "high", "auto"]).optional(),
  }),
});
type OpenRouterChatRequestImageContentType = z.infer<typeof OpenRouterChatRequestImageContent>;

const OpenRouterChatRequestToolCallContent = z.object({
  id: z.string().min(1),
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    arguments: z.string().min(1),
  }),
});
type OpenRouterChatRequestToolCallContentType = z.infer<typeof OpenRouterChatRequestToolCallContent>;

const OpenRouterChatRequestSystemMessage = z.object({
  role: z.literal("system"),
  content: z.string().min(1).or(z.array(OpenRouterChatRequestTextContent).min(1)),
});
type OpenRouterChatRequestSystemMessageType = z.infer<typeof OpenRouterChatRequestSystemMessage>;

const OpenRouterChatRequestUserMessage = z.object({
  role: z.literal("user"),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([OpenRouterChatRequestTextContent, OpenRouterChatRequestImageContent])).min(1)),
});
type OpenRouterChatRequestUserMessageType = z.infer<typeof OpenRouterChatRequestUserMessage>;

const OpenRouterChatRequestAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string().min(1).or(z.array(OpenRouterChatRequestTextContent).min(1)).optional(),
  tool_calls: z.array(OpenRouterChatRequestToolCallContent).min(1).optional(),
});
type OpenRouterChatRequestAssistantMessageType = z.infer<typeof OpenRouterChatRequestAssistantMessage>;

const OpenRouterChatRequestToolMessage = z.object({
  role: z.literal("tool"),
  tool_call_id: z.string().min(1),
  content: z.string().min(1),
});
type OpenRouterChatRequestToolMessageType = z.infer<typeof OpenRouterChatRequestToolMessage>;

const OpenRouterChatRequestMessage = z.union([
  OpenRouterChatRequestSystemMessage,
  OpenRouterChatRequestUserMessage,
  OpenRouterChatRequestAssistantMessage,
  OpenRouterChatRequestToolMessage,
]);
type OpenRouterChatRequestMessageType = z.infer<typeof OpenRouterChatRequestMessage>;

const OpenRouterChatRequest = z.object({
  model: z.string().min(1).optional(),
  messages: z.array(OpenRouterChatRequestMessage).min(1),
  frequency_penalty: z.number().min(-2).max(2).nullable().optional(),
  logprobs: z.boolean().nullable().optional(),
  top_logprobs: z.number().min(0).max(20).nullable().optional(),
  max_tokens: z.number().min(0).nullable().optional(),
  presence_penalty: z.number().min(-2).max(2).nullable().optional(),
  repetition_penalty: z.number().min(0).max(2).nullable().optional(),
  response_format: OpenRouterChatRequestResponseFormat.optional(),
  seed: z.number().nullable().optional(),
  stop: z.string().or(z.array(z.string()).max(4)).nullable().optional(),
  top_a: z.number().min(0).max(1).nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  top_p: z.number().min(0).max(1).nullable().optional(),
  top_k: z.number().min(0).max(100).nullable().optional(),
  min_p: z.number().min(0).max(1).nullable().optional(),
  tools: z.array(OpenRouterChatRequestTool).optional(),
  tool_choice: OpenRouterChatRequestToolChoiceEnum.or(OpenRouterChatRequestToolChoiceFunction).optional(),
});
type OpenRouterChatRequestType = z.infer<typeof OpenRouterChatRequest>;

export {
  OpenRouterChatRequest,
  OpenRouterChatRequestMessage,
  OpenRouterChatRequestSystemMessage,
  OpenRouterChatRequestUserMessage,
  OpenRouterChatRequestAssistantMessage,
  OpenRouterChatRequestToolMessage,
  OpenRouterChatRequestTextContent,
  OpenRouterChatRequestImageContent,
  OpenRouterChatRequestToolCallContent,
  OpenRouterChatRequestTool,
  OpenRouterChatRequestToolChoiceEnum,
  OpenRouterChatRequestToolChoiceFunction,
  OpenRouterChatRequestResponseFormat,
  type OpenRouterChatRequestType,
  type OpenRouterChatRequestMessageType,
  type OpenRouterChatRequestSystemMessageType,
  type OpenRouterChatRequestUserMessageType,
  type OpenRouterChatRequestAssistantMessageType,
  type OpenRouterChatRequestToolMessageType,
  type OpenRouterChatRequestTextContentType,
  type OpenRouterChatRequestImageContentType,
  type OpenRouterChatRequestToolCallContentType,
  type OpenRouterChatRequestToolType,
  type OpenRouterChatRequestToolChoiceEnumType,
  type OpenRouterChatRequestToolChoiceFunctionType,
  type OpenRouterChatRequestResponseFormatType,
};
