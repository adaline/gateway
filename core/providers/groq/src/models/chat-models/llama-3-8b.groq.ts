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

const Llama_3_8bLiteral = "llama3-8b-8192" as const;
// https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
const Llama_3_8bDescription =
  "The Llama 3 instruction tuned models are optimized for dialogue use cases and outperform many of \
  the available open source chat models on common industry benchmarks.";

const Llama_3_8bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_8bLiteral,
  description: Llama_3_8bDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Llama_3_8bOptions = BaseChatModelOptions;
type Llama_3_8bOptionsType = z.infer<typeof Llama_3_8bOptions>;

class Llama_3_8b extends BaseChatModelGroq {
  constructor(options: Llama_3_8bOptionsType) {
    super(Llama_3_8bSchema, options);
  }
}

export { Llama_3_8b, Llama_3_8bOptions, Llama_3_8bSchema, Llama_3_8bLiteral, type Llama_3_8bOptionsType };
