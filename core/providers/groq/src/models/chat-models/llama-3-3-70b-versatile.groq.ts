import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_3_3_70b_VersatileLiteral = "llama-3.3-70b-versatile" as const;
const Llama_3_3_70b_VersatileDescription =
  "Llama-3.3-70B-Versatile is Meta's advanced multilingual large language model, optimized for a wide range of natural language processing tasks. With 70 billion parameters, it offers high performance across various benchmarks while maintaining efficiency suitable for diverse applications.";

const Llama_3_3_70b_VersatileSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_3_70b_VersatileLiteral,
  description: Llama_3_3_70b_VersatileDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(32768).def,
    schema: GroqChatModelConfigs.base(32768).schema,
  },
  price: pricingData[Llama_3_3_70b_VersatileLiteral],
});

const Llama_3_3_70b_Versatile_Options = BaseChatModelOptions;
type Llama_3_3_70b_Versatile_OptionsType = z.infer<typeof Llama_3_3_70b_Versatile_Options>;

class Llama_3_3_70b_Versatile extends BaseChatModelGroq {
  constructor(options: Llama_3_3_70b_Versatile_OptionsType) {
    super(Llama_3_3_70b_VersatileSchema, options);
  }
}

export { Llama_3_3_70b_Versatile, Llama_3_3_70b_Versatile_Options, Llama_3_3_70b_VersatileLiteral, Llama_3_3_70b_VersatileSchema, type Llama_3_3_70b_Versatile_OptionsType };
