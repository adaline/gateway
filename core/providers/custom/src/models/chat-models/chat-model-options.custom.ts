import { z } from "zod";

const BaseChatModelOptions = z.object({
  apiKey: z.string().min(1),
  modelName: z.string(),
  baseUrl: z.string().optional(),
  completeChatUrl: z.string().optional(),
  streamChatUrl: z.string().optional(),
});

type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

export { BaseChatModelOptions, type BaseChatModelOptionsType };
