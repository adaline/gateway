import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_Guard_4_12bLiteral = "meta-llama/llama-guard-4-12b" as const;
const Llama_Guard_4_12bDescription =
  "Llama-Guard-4-12B is Meta's advanced multilingual large language model, optimized for a wide range of natural language processing tasks. With 70 billion parameters, it offers high performance across various benchmarks while maintaining efficiency suitable for diverse applications.";

const Llama_Guard_4_12bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_Guard_4_12bLiteral,
  description: Llama_Guard_4_12bDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 1024,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: GroqChatModelConfigs.base(1024).def,
    schema: GroqChatModelConfigs.base(1024).schema,
  },
  price: pricingData[Llama_Guard_4_12bLiteral],
});

const Llama_Guard_4_12b_Options = BaseChatModelOptions;
type Llama_Guard_4_12b_OptionsType = z.infer<typeof Llama_Guard_4_12b_Options>;

class Llama_Guard_4_12b extends BaseChatModelGroq {
  constructor(options: Llama_Guard_4_12b_OptionsType) {
    super(Llama_Guard_4_12bSchema, options);
  }
}

export { Llama_Guard_4_12b, Llama_Guard_4_12b_Options, Llama_Guard_4_12bLiteral, Llama_Guard_4_12bSchema, type Llama_Guard_4_12b_OptionsType };
