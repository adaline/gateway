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

const Kimi_K2_InstructLiteral = "moonshotai/kimi-k2-instruct" as const;
const Kimi_K2_InstructDescription =
  "Kimi K2 is Moonshot AI's state-of-the-art Mixture-of-Experts (MoE) language model with 1 trillion total parameters and 32 billion activated parameters. Designed for agentic intelligence, it excels at tool use, coding, and autonomous problem-solving across diverse domains.";

const Kimi_K2_InstructSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Kimi_K2_InstructLiteral,
  description: Kimi_K2_InstructDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(16384).def,
    schema: GroqChatModelConfigs.base(16384).schema,
  },
  price: pricingData[Kimi_K2_InstructLiteral],
});

const Kimi_K2_Instruct_Options = BaseChatModelOptions;
type Kimi_K2_Instruct_OptionsType = z.infer<typeof Kimi_K2_Instruct_Options>;

class Kimi_K2_Instruct extends BaseChatModelGroq {
  constructor(options: Kimi_K2_Instruct_OptionsType) {
    super(Kimi_K2_InstructSchema, options);
  }
}

export { Kimi_K2_Instruct, Kimi_K2_Instruct_Options, Kimi_K2_InstructLiteral, Kimi_K2_InstructSchema, type Kimi_K2_Instruct_OptionsType };
