import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model";

const GroqChatModelConfigs = {
  base: (maxOutputTokens: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens),
    schema: ChatModelBaseConfigSchema(maxOutputTokens),
  }),
} as const;

export { GroqChatModelConfigs };
