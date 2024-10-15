import { z } from "zod";

const BaseChatModelOptions = z.object({
  apiKey: z.string().min(1),
  deploymentId: z.string().min(1),
  resourceName: z.string().min(1).optional(),
  baseUrl: z.string().optional(),
});

type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

export { BaseChatModelOptions, type BaseChatModelOptionsType };
