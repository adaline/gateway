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

const Llama_3_70bLiteral = "llama3-70b-8192" as const;
// https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct
const Llama_3_70bDescription =
  "The Llama 3 instruction tuned models are optimized for dialogue use cases and outperform many of \
  the available open source chat models on common industry benchmarks.";

const Llama_3_70bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_70bLiteral,
  description: Llama_3_70bDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Llama_3_70bOptions = BaseChatModelOptions;
type Llama_3_70bOptionsType = z.infer<typeof Llama_3_70bOptions>;

class Llama_3_70b extends BaseChatModelGroq {
  constructor(options: Llama_3_70bOptionsType) {
    super(Llama_3_70bSchema, options);
  }
}

export { Llama_3_70b, Llama_3_70bOptions, Llama_3_70bSchema, Llama_3_70bLiteral, type Llama_3_70bOptionsType };
