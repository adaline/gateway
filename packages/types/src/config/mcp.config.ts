import { z } from "zod";

const McpServerToolConfiguration = z.object({
  enabled: z.boolean().default(true),
  allowedTools: z.array(z.string().min(1)),
});
type McpServerToolConfigurationType = z.infer<typeof McpServerToolConfiguration>;

const McpServer = z.object({
  type: z.literal("url"),
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "MCP server URL must start with https://",
    }),
  name: z.string().min(1),
  toolConfiguration: McpServerToolConfiguration.optional(),
  authorizationToken: z.string().min(1).optional(),
});
type McpServerType = z.infer<typeof McpServer>;

export { McpServer, McpServerToolConfiguration, type McpServerToolConfigurationType, type McpServerType };
