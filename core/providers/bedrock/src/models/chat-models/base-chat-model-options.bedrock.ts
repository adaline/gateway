import { z } from "zod";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  awsRegion: z.string(),
  awsAccessKeyId: z.string(),
  awsSecretAccessKey: z.string(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

export { BaseChatModelOptions, type BaseChatModelOptionsType };
