import { z } from "zod";

const AnthropicRequestThinkingContent = z.object({
  type: z.literal("thinking"),
  thinking: z.string().optional(),
  signature: z.string().optional(),
});
type AnthropicRequestThinkingContentType = z.infer<typeof AnthropicRequestThinkingContent>;

const AnthropicRequestRedactedThinkingContent = z.object({
  type: z.literal("redacted_thinking"),
  data: z.string(),
});
type AnthropicRequestRedactedThinkingContentType = z.infer<typeof AnthropicRequestRedactedThinkingContent>;

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
    media_type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]),
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

const AnthropicRequestMcpToolUseContent = z.object({
  type: z.literal("mcp_tool_use"),
  id: z.string().min(1),
  name: z.string().min(1),
  server_name: z.string().min(1),
  input: z.record(z.any()),
});
type AnthropicRequestMcpToolUseContentType = z.infer<typeof AnthropicRequestMcpToolUseContent>;

const AnthropicRequestMcpToolResultContent = z.object({
  type: z.literal("mcp_tool_result"),
  tool_use_id: z.string().min(1),
  is_error: z.boolean().default(false),
  content: z.array(z.any()),
});
type AnthropicRequestMcpToolResultContentType = z.infer<typeof AnthropicRequestMcpToolResultContent>;

const AnthropicRequestMcpServerToolConfiguration = z.object({
  enabled: z.boolean().default(true),
  allowed_tools: z.array(z.string().min(1)).optional(),
});
type AnthropicRequestMcpServerToolConfigurationType = z.infer<typeof AnthropicRequestMcpServerToolConfiguration>;

const AnthropicRequestMcpServer = z.object({
  type: z.literal("url"),
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "MCP server URL must start with https://",
    }),
  name: z.string().min(1),
  tool_configuration: AnthropicRequestMcpServerToolConfiguration.optional(),
  authorization_token: z.string().min(1).optional(),
});
type AnthropicRequestMcpServerType = z.infer<typeof AnthropicRequestMcpServer>;

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
    .or(
      z
        .array(
          z.union([
            AnthropicRequestTextContent,
            AnthropicRequestToolResponseContent,
            AnthropicRequestThinkingContent,
            AnthropicRequestRedactedThinkingContent,
          ])
        )
        .min(1)
    ),
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
  mcp_servers: z.array(AnthropicRequestMcpServer).min(1).optional(),
});
type AnthropicRequestType = z.infer<typeof AnthropicRequest>;

export {
  AnthropicRequest,
  AnthropicRequestAssistantMessage,
  AnthropicRequestImageContent,
  AnthropicRequestMcpServer,
  AnthropicRequestMcpServerToolConfiguration,
  AnthropicRequestMcpToolResultContent,
  AnthropicRequestMcpToolUseContent,
  AnthropicRequestMessage,
  AnthropicRequestRedactedThinkingContent,
  AnthropicRequestTextContent,
  AnthropicRequestThinkingContent,
  AnthropicRequestTool,
  AnthropicRequestToolCallContent,
  AnthropicRequestToolChoiceEnum,
  AnthropicRequestToolChoiceTool,
  AnthropicRequestToolResponseContent,
  AnthropicRequestUserMessage,
  type AnthropicRequestAssistantMessageType,
  type AnthropicRequestImageContentType,
  type AnthropicRequestMcpServerToolConfigurationType,
  type AnthropicRequestMcpServerType,
  type AnthropicRequestMcpToolResultContentType,
  type AnthropicRequestMcpToolUseContentType,
  type AnthropicRequestMessageType,
  type AnthropicRequestRedactedThinkingContentType,
  type AnthropicRequestTextContentType,
  type AnthropicRequestThinkingContentType,
  type AnthropicRequestToolCallContentType,
  type AnthropicRequestToolChoiceEnumType,
  type AnthropicRequestToolChoiceToolType,
  type AnthropicRequestToolResponseContentType,
  type AnthropicRequestToolType,
  type AnthropicRequestType,
  type AnthropicRequestUserMessageType,
};
