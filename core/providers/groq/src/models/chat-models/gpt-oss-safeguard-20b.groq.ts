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

// Specs reference: https://console.groq.com/docs/models (retrieved 2026-02-25)
const Gpt_Oss_Safeguard_20bLiteral = "openai/gpt-oss-safeguard-20b" as const;
const Gpt_Oss_Safeguard_20bDescription =
  "Safety-focused GPT-OSS model for policy enforcement and moderation checks in agent pipelines.";

const Gpt_Oss_Safeguard_20bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Gpt_Oss_Safeguard_20bLiteral,
  description: Gpt_Oss_Safeguard_20bDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
  price: pricingData[Gpt_Oss_Safeguard_20bLiteral],
});

const Gpt_Oss_Safeguard_20b_Options = BaseChatModelOptions;
type Gpt_Oss_Safeguard_20b_OptionsType = z.infer<typeof Gpt_Oss_Safeguard_20b_Options>;

class Gpt_Oss_Safeguard_20b extends BaseChatModelGroq {
  constructor(options: Gpt_Oss_Safeguard_20b_OptionsType) {
    super(Gpt_Oss_Safeguard_20bSchema, options);
  }
}

export {
  Gpt_Oss_Safeguard_20b,
  Gpt_Oss_Safeguard_20b_Options,
  Gpt_Oss_Safeguard_20bLiteral,
  Gpt_Oss_Safeguard_20bSchema,
  type Gpt_Oss_Safeguard_20b_OptionsType,
};

