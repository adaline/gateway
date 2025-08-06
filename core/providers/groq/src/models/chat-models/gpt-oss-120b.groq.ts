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

const Gpt_Oss_120bLiteral = "openai/gpt-oss-120b" as const;
const Gpt_Oss_120bDescription =
  "GPT-OSS 120B is OpenAI's flagship open source model, built on a Mixture-of-Experts (MoE) architecture with 20 billion parameters and 128 experts.";

const Gpt_Oss_120bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Gpt_Oss_120bLiteral,
  description: Gpt_Oss_120bDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 32766,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(32766).def,
    schema: GroqChatModelConfigs.base(32766).schema,
  },
  price: pricingData[Gpt_Oss_120bLiteral],
});

const Gpt_Oss_120b_Options = BaseChatModelOptions;
type Gpt_Oss_120b_OptionsType = z.infer<typeof Gpt_Oss_120b_Options>;

class Gpt_Oss_120b extends BaseChatModelGroq {
  constructor(options: Gpt_Oss_120b_OptionsType) {
    super(Gpt_Oss_120bSchema, options);
  }
}

export { Gpt_Oss_120b, Gpt_Oss_120b_Options, Gpt_Oss_120bLiteral, Gpt_Oss_120bSchema, type Gpt_Oss_120b_OptionsType };
