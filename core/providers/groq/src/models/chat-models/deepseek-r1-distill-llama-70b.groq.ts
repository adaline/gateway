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

const Deepseek_R1_Distill_Llama_70bLiteral = "deepseek-r1-distill-llama-70b" as const;
const Deepseek_R1_Distill_Llama_70bDescription =
  "DeepSeek-R1-Distill-Llama-70B is a distilled version of DeepSeek's R1 model, fine-tuned from the Llama-3.3-70B-Instruct base model. This model leverages knowledge distillation to retain robust reasoning capabilities and deliver exceptional performance on mathematical and logical reasoning tasks with Groq's industry-leading speed.";

const Deepseek_R1_Distill_Llama_70bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Deepseek_R1_Distill_Llama_70bLiteral,
  description: Deepseek_R1_Distill_Llama_70bDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(128000).def,
    schema: GroqChatModelConfigs.base(128000).schema,
  },
  price: pricingData[Deepseek_R1_Distill_Llama_70bLiteral],
});

const Deepseek_R1_Distill_Llama_70b_Options = BaseChatModelOptions;
type Deepseek_R1_Distill_Llama_70b_OptionsType = z.infer<typeof Deepseek_R1_Distill_Llama_70b_Options>;

class Deepseek_R1_Distill_Llama_70b extends BaseChatModelGroq {
  constructor(options: Deepseek_R1_Distill_Llama_70b_OptionsType) {
    super(Deepseek_R1_Distill_Llama_70bSchema, options);
  }
}

export { Deepseek_R1_Distill_Llama_70b, Deepseek_R1_Distill_Llama_70b_Options, Deepseek_R1_Distill_Llama_70bLiteral, Deepseek_R1_Distill_Llama_70bSchema, type Deepseek_R1_Distill_Llama_70b_OptionsType };
