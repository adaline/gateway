import { z } from "zod";

const OpenAIChatRequestTool = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    strict: z.boolean().optional(),
    parameters: z.any(),
  }),
});
type OpenAIChatRequestToolType = z.infer<typeof OpenAIChatRequestTool>;

const OpenAIChatRequestToolChoiceEnum = z.enum(["none", "auto", "required"]);
type OpenAIChatRequestToolChoiceEnumType = z.infer<typeof OpenAIChatRequestToolChoiceEnum>;

const OpenAIChatRequestToolChoiceFunction = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
  }),
});
type OpenAIChatRequestToolChoiceFunctionType = z.infer<typeof OpenAIChatRequestToolChoiceFunction>;

const OpenAIChatRequestResponseFormat = z
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
type OpenAIChatRequestResponseFormatType = z.infer<typeof OpenAIChatRequestResponseFormat>;

const OpenAIChatRequestTextContent = z.object({
  text: z.string().min(1),
  type: z.literal("text"),
});
type OpenAIChatRequestTextContentType = z.infer<typeof OpenAIChatRequestTextContent>;

const OpenAIChatRequestImageContent = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string().url().min(1),
    detail: z.enum(["low", "high", "auto"]).optional(),
  }),
});
type OpenAIChatRequestImageContentType = z.infer<typeof OpenAIChatRequestImageContent>;

const OpenAIChatRequestToolCallContent = z.object({
  id: z.string().min(1),
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    arguments: z.string().min(1),
  }),
});
type OpenAIChatRequestToolCallContentType = z.infer<typeof OpenAIChatRequestToolCallContent>;

const OpenAIChatRequestSystemMessage = z.object({
  role: z.literal("system"),
  content: z.string().min(1).or(z.array(OpenAIChatRequestTextContent).min(1)),
});
type OpenAIChatRequestSystemMessageType = z.infer<typeof OpenAIChatRequestSystemMessage>;

const OpenAIChatRequestUserMessage = z.object({
  role: z.literal("user"),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([OpenAIChatRequestTextContent, OpenAIChatRequestImageContent])).min(1)),
});
type OpenAIChatRequestUserMessageType = z.infer<typeof OpenAIChatRequestUserMessage>;

const OpenAIChatRequestAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string().min(1).or(z.array(OpenAIChatRequestTextContent).min(1)).optional(),
  tool_calls: z.array(OpenAIChatRequestToolCallContent).min(1).optional(),
});
type OpenAIChatRequestAssistantMessageType = z.infer<typeof OpenAIChatRequestAssistantMessage>;

const OpenAIChatRequestToolMessage = z.object({
  role: z.literal("tool"),
  tool_call_id: z.string().min(1),
  content: z.string().min(1),
});
type OpenAIChatRequestToolMessageType = z.infer<typeof OpenAIChatRequestToolMessage>;

const OpenAIChatRequestMessage = z.union([
  OpenAIChatRequestSystemMessage,
  OpenAIChatRequestUserMessage,
  OpenAIChatRequestAssistantMessage,
  OpenAIChatRequestToolMessage,
]);
type OpenAIChatRequestMessageType = z.infer<typeof OpenAIChatRequestMessage>;

const OpenAIChatRequest = z.object({
  model: z.string().min(1).optional(),
  messages: z.array(OpenAIChatRequestMessage).min(1),
  frequency_penalty: z.number().min(-2).max(2).nullable().optional(),
  logprobs: z.boolean().nullable().optional(),
  top_logprobs: z.number().min(0).max(20).nullable().optional(),
  max_tokens: z.number().min(0).nullable().optional(),
  presence_penalty: z.number().min(-2).max(2).nullable().optional(),
  response_format: OpenAIChatRequestResponseFormat.optional(),
  seed: z.number().nullable().optional(),
  stop: z.string().or(z.array(z.string()).max(4)).nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  top_p: z.number().min(0).max(1).nullable().optional(),
  tools: z.array(OpenAIChatRequestTool).optional(),
  tool_choice: OpenAIChatRequestToolChoiceEnum.or(OpenAIChatRequestToolChoiceFunction).optional(),
});
type OpenAIChatRequestType = z.infer<typeof OpenAIChatRequest>;

export {
  OpenAIChatRequest,
  OpenAIChatRequestMessage,
  OpenAIChatRequestSystemMessage,
  OpenAIChatRequestUserMessage,
  OpenAIChatRequestAssistantMessage,
  OpenAIChatRequestToolMessage,
  OpenAIChatRequestTextContent,
  OpenAIChatRequestImageContent,
  OpenAIChatRequestToolCallContent,
  OpenAIChatRequestTool,
  OpenAIChatRequestToolChoiceEnum,
  OpenAIChatRequestToolChoiceFunction,
  OpenAIChatRequestResponseFormat,
  type OpenAIChatRequestType,
  type OpenAIChatRequestMessageType,
  type OpenAIChatRequestSystemMessageType,
  type OpenAIChatRequestUserMessageType,
  type OpenAIChatRequestAssistantMessageType,
  type OpenAIChatRequestToolMessageType,
  type OpenAIChatRequestTextContentType,
  type OpenAIChatRequestImageContentType,
  type OpenAIChatRequestToolCallContentType,
  type OpenAIChatRequestToolType,
  type OpenAIChatRequestToolChoiceEnumType,
  type OpenAIChatRequestToolChoiceFunctionType,
  type OpenAIChatRequestResponseFormatType,
};
