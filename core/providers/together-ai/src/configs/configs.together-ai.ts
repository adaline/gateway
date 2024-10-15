import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./chat-model";

const TogetherAIChatModelConfigs = {
  base: (maxOutputTokens: number, maxSequences: number) => ({
    def: ChatModelBaseConfigDef(maxOutputTokens, maxSequences),
    schema: ChatModelBaseConfigSchema(maxOutputTokens, maxSequences),
  }),
} as const;

export { TogetherAIChatModelConfigs };
