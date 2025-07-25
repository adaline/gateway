import { z } from "zod";

import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_4_Maverick_17b_128e_InstructLiteral = "meta-llama/llama-4-maverick-17b-128e-instruct" as const;
const Llama_4_Maverick_17b_128e_InstructDescription =
  "Llama 4 Maverick is Meta's natively multimodal model that enables text and image understanding. Model offers industry-leading performance for multimodal tasks like natural assistant-like chat, image recognition, and coding tasks.";

const Llama_4_Maverick_17b_128e_InstructSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: Llama_4_Maverick_17b_128e_InstructLiteral,
  description: Llama_4_Maverick_17b_128e_InstructDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
  price: pricingData[Llama_4_Maverick_17b_128e_InstructLiteral],
});

const Llama_4_Maverick_17b_128e_Instruct_Options = BaseChatModelOptions;
type Llama_4_Maverick_17b_128e_Instruct_OptionsType = z.infer<typeof Llama_4_Maverick_17b_128e_Instruct_Options>;

class Llama_4_Maverick_17b_128e_Instruct extends BaseChatModelGroq {
  constructor(options: Llama_4_Maverick_17b_128e_Instruct_OptionsType) {
    super(Llama_4_Maverick_17b_128e_InstructSchema, options);
  }
}

export {
  Llama_4_Maverick_17b_128e_Instruct,
  Llama_4_Maverick_17b_128e_Instruct_Options,
  Llama_4_Maverick_17b_128e_InstructLiteral,
  Llama_4_Maverick_17b_128e_InstructSchema,
  type Llama_4_Maverick_17b_128e_Instruct_OptionsType,
};
