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

const Llama_4_Scout_17b_16e_InstructLiteral = "meta-llama/llama-4-scout-17b-16e-instruct" as const;
const Llama_4_Scout_17b_16e_InstructDescription =
  "Llama-4-Scout-17B-16E-Instruct is Meta's efficient large language model with 17 billion parameters, designed for fast inference with extended context window of 131,072 tokens and maximum output of 8,192 tokens.";

const Llama_4_Scout_17b_16e_InstructSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_4_Scout_17b_16e_InstructLiteral,
  description: Llama_4_Scout_17b_16e_InstructDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
  price: pricingData[Llama_4_Scout_17b_16e_InstructLiteral],
});

const Llama_4_Scout_17b_16e_Instruct_Options = BaseChatModelOptions;
type Llama_4_Scout_17b_16e_Instruct_OptionsType = z.infer<typeof Llama_4_Scout_17b_16e_Instruct_Options>;

class Llama_4_Scout_17b_16e_Instruct extends BaseChatModelGroq {
  constructor(options: Llama_4_Scout_17b_16e_Instruct_OptionsType) {
    super(Llama_4_Scout_17b_16e_InstructSchema, options);
  }
}

export { Llama_4_Scout_17b_16e_Instruct, Llama_4_Scout_17b_16e_Instruct_Options, Llama_4_Scout_17b_16e_InstructLiteral, Llama_4_Scout_17b_16e_InstructSchema, type Llama_4_Scout_17b_16e_Instruct_OptionsType };
