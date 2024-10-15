import { z } from "zod";

const AnthropicRequestTool = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  input_schema: z.any(), // TODO: should be more strict, implement the same for all providers
});
type AnthropicRequestToolType = z.infer<typeof AnthropicRequestTool>;

const AnthropicRequestToolChoiceEnum = z.object({
  type: z.enum(["auto", "any"]),
});
type AnthropicRequestToolChoiceEnumType = z.infer<typeof AnthropicRequestToolChoiceEnum>;

const AnthropicRequestToolChoiceTool = z.object({
  type: z.literal("tool"),
  name: z.string().min(1),
});
type AnthropicRequestToolChoiceToolType = z.infer<typeof AnthropicRequestToolChoiceTool>;

const AnthropicRequestTextContent = z.object({
  text: z.string().min(1),
  type: z.literal("text"),
});
type AnthropicRequestTextContentType = z.infer<typeof AnthropicRequestTextContent>;

const AnthropicRequestImageContent = z.object({
  type: z.literal("image"),
  source: z.object({
    type: z.literal("base64"),
    media_type: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
    data: z.string().base64(),
  }),
});
type AnthropicRequestImageContentType = z.infer<typeof AnthropicRequestImageContent>;

const AnthropicRequestToolCallContent = z.object({
  id: z.string().min(1),
  type: z.literal("tool_use"),
  name: z.string().min(1),
  input: z.record(z.any()),
});
type AnthropicRequestToolCallContentType = z.infer<typeof AnthropicRequestToolCallContent>;

const AnthropicRequestToolResponseContent = z.object({
  type: z.literal("tool_result"),
  tool_use_id: z.string().min(1),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([AnthropicRequestTextContent, AnthropicRequestImageContent])).min(1)),
});
type AnthropicRequestToolResponseContentType = z.infer<typeof AnthropicRequestToolResponseContent>;

const AnthropicRequestUserMessage = z.object({
  role: z.literal("user"),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([AnthropicRequestTextContent, AnthropicRequestImageContent, AnthropicRequestToolResponseContent])).min(1)),
});
type AnthropicRequestUserMessageType = z.infer<typeof AnthropicRequestUserMessage>;

const AnthropicRequestAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z
    .string()
    .min(1)
    .or(z.array(z.union([AnthropicRequestTextContent, AnthropicRequestToolResponseContent])).min(1)),
});
type AnthropicRequestAssistantMessageType = z.infer<typeof AnthropicRequestAssistantMessage>;

const AnthropicRequestMessage = z.union([AnthropicRequestUserMessage, AnthropicRequestAssistantMessage]);
type AnthropicRequestMessageType = z.infer<typeof AnthropicRequestMessage>;

const AnthropicRequest = z.object({
  model: z.string().min(1).optional(),
  messages: z.array(AnthropicRequestMessage).min(1),
  system: z.string().min(1).optional(),
  max_tokens: z.number().min(0).optional(),
  stop_sequences: z.array(z.string().min(1)).optional(),
  temperature: z.number().min(0).max(1).optional(),
  tool_choice: z.union([AnthropicRequestToolChoiceEnum, AnthropicRequestToolChoiceTool]).optional(),
  tools: z.array(AnthropicRequestTool).min(1).optional(),
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().min(0).optional(),
});
type AnthropicRequestType = z.infer<typeof AnthropicRequest>;

export {
  AnthropicRequest,
  AnthropicRequestMessage,
  AnthropicRequestUserMessage,
  AnthropicRequestAssistantMessage,
  AnthropicRequestTool,
  AnthropicRequestToolChoiceEnum,
  AnthropicRequestToolChoiceTool,
  AnthropicRequestTextContent,
  AnthropicRequestImageContent,
  AnthropicRequestToolCallContent,
  AnthropicRequestToolResponseContent,
  type AnthropicRequestType,
  type AnthropicRequestMessageType,
  type AnthropicRequestUserMessageType,
  type AnthropicRequestAssistantMessageType,
  type AnthropicRequestToolType,
  type AnthropicRequestToolChoiceEnumType,
  type AnthropicRequestToolChoiceToolType,
  type AnthropicRequestTextContentType,
  type AnthropicRequestImageContentType,
  type AnthropicRequestToolCallContentType,
  type AnthropicRequestToolResponseContentType,
};
