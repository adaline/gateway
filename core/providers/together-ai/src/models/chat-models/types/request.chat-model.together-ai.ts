import { z } from "zod";

const TogetherAIChatRequestTool = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    strict: z.boolean().optional(),
    parameters: z.any(),
  }),
});
type TogetherAIChatRequestToolType = z.infer<typeof TogetherAIChatRequestTool>;

const TogetherAIChatRequestToolChoiceEnum = z.enum(["none", "auto", "required"]);
type TogetherAIChatRequestToolChoiceEnumType = z.infer<typeof TogetherAIChatRequestToolChoiceEnum>;

const TogetherAIChatRequestToolChoiceFunction = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
  }),
});
type TogetherAIChatRequestToolChoiceFunctionType = z.infer<typeof TogetherAIChatRequestToolChoiceFunction>;

// TODO: fix this for together AI format
const TogetherAIChatRequestResponseFormat = z
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
type TogetherAIChatRequestResponseFormatType = z.infer<typeof TogetherAIChatRequestResponseFormat>;

const TogetherAIChatRequestTextContent = z.string();
type TogetherAIChatRequestTextContentType = z.infer<typeof TogetherAIChatRequestTextContent>;

const TogetherAIChatRequestToolCallContent = z.object({
  id: z.string().min(1),
  type: z.literal("function"),
  function: z.object({
    name: z.string().min(1),
    arguments: z.string().min(1),
  }),
});
type TogetherAIChatRequestToolCallContentType = z.infer<typeof TogetherAIChatRequestToolCallContent>;

const TogetherAIChatRequestSystemMessage = z.object({
  role: z.literal("system"),
  content: TogetherAIChatRequestTextContent,
});
type TogetherAIChatRequestSystemMessageType = z.infer<typeof TogetherAIChatRequestSystemMessage>;

const TogetherAIChatRequestUserMessage = z.object({
  role: z.literal("user"),
  content: TogetherAIChatRequestTextContent,
});
type TogetherAIChatRequestUserMessageType = z.infer<typeof TogetherAIChatRequestUserMessage>;

const TogetherAIChatRequestAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: TogetherAIChatRequestTextContent.optional(),
  tool_calls: z.array(TogetherAIChatRequestToolCallContent).min(1).optional(),
});
type TogetherAIChatRequestAssistantMessageType = z.infer<typeof TogetherAIChatRequestAssistantMessage>;

const TogetherAIChatRequestToolMessage = z.object({
  role: z.literal("tool"),
  tool_call_id: z.string().min(1),
  content: z.string().min(1),
});
type TogetherAIChatRequestToolMessageType = z.infer<typeof TogetherAIChatRequestToolMessage>;

const TogetherAIChatRequestMessage = z.union([
  TogetherAIChatRequestSystemMessage,
  TogetherAIChatRequestUserMessage,
  TogetherAIChatRequestAssistantMessage,
  TogetherAIChatRequestToolMessage,
]);
type TogetherAIChatRequestMessageType = z.infer<typeof TogetherAIChatRequestMessage>;

const TogetherAIChatRequest = z.object({
  model: z.string().min(1).optional(),
  messages: z.array(TogetherAIChatRequestMessage).min(1),
  frequency_penalty: z.number().min(-2).max(2).nullable().optional(),
  logprobs: z.number().min(0).max(1).nullable().optional(),
  max_tokens: z.number().min(0).nullable().optional(),
  presence_penalty: z.number().min(-2).max(2).nullable().optional(),
  repetition_penalty: z.number().min(0).max(2).nullable().optional(),
  response_format: TogetherAIChatRequestResponseFormat.optional(),
  seed: z.number().optional(),
  stop: z.string().or(z.array(z.string()).max(4)).nullable().optional(),
  temperature: z.number().min(0).max(1).nullable().optional(),
  top_p: z.number().min(0).max(1).nullable().optional(),
  top_k: z.number().min(0).max(10000).nullable().optional(),
  min_p: z.number().min(0).max(1).nullable().optional(),
  echo: z.boolean().nullable().optional(),
  tools: z.array(TogetherAIChatRequestTool).optional(),
  tool_choice: TogetherAIChatRequestToolChoiceEnum.or(TogetherAIChatRequestToolChoiceFunction).optional(),
});
type TogetherAIChatRequestType = z.infer<typeof TogetherAIChatRequest>;

export {
  TogetherAIChatRequest,
  TogetherAIChatRequestMessage,
  TogetherAIChatRequestSystemMessage,
  TogetherAIChatRequestUserMessage,
  TogetherAIChatRequestAssistantMessage,
  TogetherAIChatRequestToolMessage,
  TogetherAIChatRequestTextContent,
  TogetherAIChatRequestToolCallContent,
  TogetherAIChatRequestTool,
  TogetherAIChatRequestToolChoiceEnum,
  TogetherAIChatRequestToolChoiceFunction,
  TogetherAIChatRequestResponseFormat,
  type TogetherAIChatRequestType,
  type TogetherAIChatRequestMessageType,
  type TogetherAIChatRequestSystemMessageType,
  type TogetherAIChatRequestUserMessageType,
  type TogetherAIChatRequestAssistantMessageType,
  type TogetherAIChatRequestToolMessageType,
  type TogetherAIChatRequestTextContentType,
  type TogetherAIChatRequestToolCallContentType,
  type TogetherAIChatRequestToolType,
  type TogetherAIChatRequestToolChoiceEnumType,
  type TogetherAIChatRequestToolChoiceFunctionType,
  type TogetherAIChatRequestResponseFormatType,
};
