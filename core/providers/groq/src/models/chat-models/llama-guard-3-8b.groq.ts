import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const LlamaGuard_3_8bLiteral = "llama-guard-3-8b" as const;
// https://huggingface.co/meta-llama/Llama-Guard-3-8B
const LlamaGuard_3_8bDescription = "Llama Guard 3 is a Llama-3.1-8B pretrained model, fine-tuned for content safety classification.";

const LlamaGuard_3_8bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: LlamaGuard_3_8bLiteral,
  description: LlamaGuard_3_8bDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const LlamaGuard_3_8bOptions = BaseChatModelOptions;
type LlamaGuard_3_8bOptionsType = z.infer<typeof LlamaGuard_3_8bOptions>;

class LlamaGuard_3_8b extends BaseChatModelGroq {
  constructor(options: LlamaGuard_3_8bOptionsType) {
    super(LlamaGuard_3_8bSchema, options);
  }
}

export { LlamaGuard_3_8b, LlamaGuard_3_8bOptions, LlamaGuard_3_8bSchema, LlamaGuard_3_8bLiteral, type LlamaGuard_3_8bOptionsType };
