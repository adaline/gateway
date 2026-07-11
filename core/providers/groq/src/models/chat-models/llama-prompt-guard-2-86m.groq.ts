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

// Specs reference: https://console.groq.com/docs/model/meta-llama/llama-prompt-guard-2-86m,
// https://console.groq.com/docs/models (retrieved 2026-07-10)
const Llama_Prompt_Guard_2_86mLiteral = "meta-llama/llama-prompt-guard-2-86m" as const;
const Llama_Prompt_Guard_2_86mDescription =
  "Llama Prompt Guard 2 86M is Meta's 86M-parameter classifier that detects and prevents prompt attacks, such as \
  prompt injection and jailbreaks, across 8 languages. Sibling of the Llama Guard security-model family.";

const Llama_Prompt_Guard_2_86mSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_Prompt_Guard_2_86mLiteral,
  description: Llama_Prompt_Guard_2_86mDescription,
  maxInputTokens: 512,
  maxOutputTokens: 512,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: GroqChatModelConfigs.base(512).def,
    schema: GroqChatModelConfigs.base(512).schema,
  },
  price: pricingData[Llama_Prompt_Guard_2_86mLiteral],
});

const Llama_Prompt_Guard_2_86m_Options = BaseChatModelOptions;
type Llama_Prompt_Guard_2_86m_OptionsType = z.infer<typeof Llama_Prompt_Guard_2_86m_Options>;

class Llama_Prompt_Guard_2_86m extends BaseChatModelGroq {
  constructor(options: Llama_Prompt_Guard_2_86m_OptionsType) {
    super(Llama_Prompt_Guard_2_86mSchema, options);
  }
}

export {
  Llama_Prompt_Guard_2_86m,
  Llama_Prompt_Guard_2_86m_Options,
  Llama_Prompt_Guard_2_86mLiteral,
  Llama_Prompt_Guard_2_86mSchema,
  type Llama_Prompt_Guard_2_86m_OptionsType,
};
