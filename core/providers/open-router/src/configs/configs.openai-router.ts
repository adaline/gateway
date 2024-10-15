import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model";

const OpenRouterChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
} as const;

export { OpenRouterChatModelConfigs };
