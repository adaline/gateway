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

const Gpt_Oss_20bLiteral = "openai/gpt-oss-20b" as const;
const Gpt_Oss_20bDescription =
  "GPT-OSS 20B is OpenAI's flagship open source model, built on a Mixture-of-Experts (MoE) architecture with 20 billion parameters and 32 experts.";

const Gpt_Oss_20bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Gpt_Oss_20bLiteral,
  description: Gpt_Oss_20bDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(32768).def,
    schema: GroqChatModelConfigs.base(32768).schema,
  },
  price: pricingData[Gpt_Oss_20bLiteral],
});

const Gpt_Oss_20b_Options = BaseChatModelOptions;
type Gpt_Oss_20b_OptionsType = z.infer<typeof Gpt_Oss_20b_Options>;

class Gpt_Oss_20b extends BaseChatModelGroq {
  constructor(options: Gpt_Oss_20b_OptionsType) {
    super(Gpt_Oss_20bSchema, options);
  }
}

export { Gpt_Oss_20b, Gpt_Oss_20b_Options, Gpt_Oss_20bLiteral, Gpt_Oss_20bSchema, type Gpt_Oss_20b_OptionsType };
