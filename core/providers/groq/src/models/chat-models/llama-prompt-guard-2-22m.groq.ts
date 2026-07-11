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

// Specs reference: https://console.groq.com/docs/models (retrieved 2026-07-10)
const Llama_Prompt_Guard_2_22mLiteral = "meta-llama/llama-prompt-guard-2-22m" as const;
const Llama_Prompt_Guard_2_22mDescription =
  "Llama Prompt Guard 2 22M is Meta's 22M-parameter classifier, a smaller and cheaper sibling of the 86M variant, \
  that detects and prevents prompt attacks such as prompt injection and jailbreaks.";

const Llama_Prompt_Guard_2_22mSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_Prompt_Guard_2_22mLiteral,
  description: Llama_Prompt_Guard_2_22mDescription,
  maxInputTokens: 512,
  maxOutputTokens: 512,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: GroqChatModelConfigs.base(512).def,
    schema: GroqChatModelConfigs.base(512).schema,
  },
  price: pricingData[Llama_Prompt_Guard_2_22mLiteral],
});

const Llama_Prompt_Guard_2_22m_Options = BaseChatModelOptions;
type Llama_Prompt_Guard_2_22m_OptionsType = z.infer<typeof Llama_Prompt_Guard_2_22m_Options>;

class Llama_Prompt_Guard_2_22m extends BaseChatModelGroq {
  constructor(options: Llama_Prompt_Guard_2_22m_OptionsType) {
    super(Llama_Prompt_Guard_2_22mSchema, options);
  }
}

export {
  Llama_Prompt_Guard_2_22m,
  Llama_Prompt_Guard_2_22m_Options,
  Llama_Prompt_Guard_2_22mLiteral,
  Llama_Prompt_Guard_2_22mSchema,
  type Llama_Prompt_Guard_2_22m_OptionsType,
};
