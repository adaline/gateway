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

const Llama_3_2_1bLiteral = "llama-3.2-1b-preview" as const;
// https://huggingface.co/meta-llama/Llama-3.2-1B
const Llama_3_2_1bDescription =
  "The Llama 3.2 instruction-tuned text only models are optimized for multilingual dialogue use cases, including agentic retrieval and \
  summarization tasks. They outperform many of the available open source and closed chat models on common industry benchmarks.";

const Llama_3_2_1bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_2_1bLiteral,
  description: Llama_3_2_1bDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
});

const Llama_3_2_1b_Options = BaseChatModelOptions;
type Llama_3_2_1b_OptionsType = z.infer<typeof Llama_3_2_1b_Options>;

class Llama_3_2_1b extends BaseChatModelGroq {
  constructor(options: Llama_3_2_1b_OptionsType) {
    super(Llama_3_2_1bSchema, options);
  }
}

export { Llama_3_2_1b, Llama_3_2_1b_Options, Llama_3_2_1bSchema, Llama_3_2_1bLiteral, type Llama_3_2_1b_OptionsType };
