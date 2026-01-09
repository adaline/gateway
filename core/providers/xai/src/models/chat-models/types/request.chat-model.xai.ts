import { z } from "zod";

const XAIChatRequestTool = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    strict: z.boolean().optional(),
    parameters: z.any(),
  }),
});
type XAIChatRequestToolType = z.infer<typeof XAIChatRequestTool>;

const XAIChatRequestToolChoiceEnum = z.enum(["none", "auto", "required"]);
type XAIChatRequestToolChoiceEnumType = z.infer<typeof XAIChatRequestToolChoiceEnum>;

const XAIChatRequestToolChoiceFunction = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
  }),
});
type XAIChatRequestToolChoiceFunctionType = z.infer<typeof XAIChatRequestToolChoiceFunction>;

const XAIChatRequestResponseFormat = z
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
type XAIChatRequestResponseFormatType = z.infer<typeof XAIChatRequestResponseFormat>;

const XAIChatRequestTextContent = z.object({
  text: z.string().min(1),
  type: z.literal("text"),
});
type XAIChatRequestTextContentType = z.infer<typeof XAIChatRequestTextContent>;

const XAIChatRequestImageContent = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string().min(1),
    detail: z.enum(["low", "high", "auto"]).optional(),
  }),
});
type XAIChatRequestImageContentType = z.infer<typeof XAIChatRequestImageContent>;

const XAIChatRequestToolCallContent = z.object({
  id: z.string().min(1),
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    arguments: z.string().min(1),
  }),
});
type XAIChatRequestToolCallContentType = z.infer<typeof XAIChatRequestToolCallContent>;

const XAIChatRequestSystemMessage = z.object({
  role: z.literal("system"),
  content: z.string().min(1).or(z.array(XAIChatRequestTextContent).min(1)),
});
type XAIChatRequestSystemMessageType = z.infer<typeof XAIChatRequestSystemMessage>;

const XAIChatRequestUserMessage = z.object({
  role: z.literal("user"),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([XAIChatRequestTextContent, XAIChatRequestImageContent])).min(1)),
});
type XAIChatRequestUserMessageType = z.infer<typeof XAIChatRequestUserMessage>;

const XAIChatRequestAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string().min(1).or(z.array(XAIChatRequestTextContent).min(1)).optional(),
  tool_calls: z.array(XAIChatRequestToolCallContent).min(1).optional(),
});
type XAIChatRequestAssistantMessageType = z.infer<typeof XAIChatRequestAssistantMessage>;

const XAIChatRequestToolMessage = z.object({
  role: z.literal("tool"),
  tool_call_id: z.string().min(1),
  content: z.string().min(1),
});
type XAIChatRequestToolMessageType = z.infer<typeof XAIChatRequestToolMessage>;

const XAIChatRequestMessage = z.union([
  XAIChatRequestSystemMessage,
  XAIChatRequestUserMessage,
  XAIChatRequestAssistantMessage,
  XAIChatRequestToolMessage,
]);
type XAIChatRequestMessageType = z.infer<typeof XAIChatRequestMessage>;

const XAIChatRequest = z.object({
  model: z.string().min(1).optional(),
  messages: z.array(XAIChatRequestMessage).min(1),
  frequency_penalty: z.number().min(-2).max(2).nullable().optional(),
  logprobs: z.boolean().nullable().optional(),
  top_logprobs: z.number().min(0).max(20).nullable().optional(),
  max_tokens: z.number().min(0).nullable().optional(),
  presence_penalty: z.number().min(-2).max(2).nullable().optional(),
  response_format: XAIChatRequestResponseFormat.optional(),
  seed: z.number().nullable().optional(),
  stop: z.string().or(z.array(z.string()).max(4)).nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  top_p: z.number().min(0).max(1).nullable().optional(),
  tools: z.array(XAIChatRequestTool).optional(),
  tool_choice: XAIChatRequestToolChoiceEnum.or(XAIChatRequestToolChoiceFunction).optional(),
  reasoning_effort: z.enum(["low", "high"]).optional(),
});
type XAIChatRequestType = z.infer<typeof XAIChatRequest>;

export {
  XAIChatRequest,
  XAIChatRequestAssistantMessage,
  XAIChatRequestImageContent,
  XAIChatRequestMessage,
  XAIChatRequestResponseFormat,
  XAIChatRequestSystemMessage,
  XAIChatRequestTextContent,
  XAIChatRequestTool,
  XAIChatRequestToolCallContent,
  XAIChatRequestToolChoiceEnum,
  XAIChatRequestToolChoiceFunction,
  XAIChatRequestToolMessage,
  XAIChatRequestUserMessage,
  type XAIChatRequestAssistantMessageType,
  type XAIChatRequestImageContentType,
  type XAIChatRequestMessageType,
  type XAIChatRequestResponseFormatType,
  type XAIChatRequestSystemMessageType,
  type XAIChatRequestTextContentType,
  type XAIChatRequestToolCallContentType,
  type XAIChatRequestToolChoiceEnumType,
  type XAIChatRequestToolChoiceFunctionType,
  type XAIChatRequestToolMessageType,
  type XAIChatRequestToolType,
  type XAIChatRequestType,
  type XAIChatRequestUserMessageType,
};
