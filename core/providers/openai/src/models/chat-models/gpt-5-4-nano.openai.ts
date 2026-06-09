import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelWithWebSearchModalities,
  OpenAIChatModelWithWebSearchModalitiesEnum,
} from "./types";

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.4-nano (retrieved 2026-06-09)
const GPT_5_4_NanoLiteral = "gpt-5.4-nano";
const GPT_5_4_NanoDescription =
  "Cheapest, fastest GPT-5.4-class model for simple, high-volume tasks like classification, extraction, and ranking. \
  Training data up to August 2025.";

const GPT_5_4_NanoSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_4_NanoLiteral,
  description: GPT_5_4_NanoDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_4_NanoLiteral],
});

const GPT_5_4_NanoOptions = BaseChatModelOptions;
type GPT_5_4_NanoOptionsType = z.infer<typeof GPT_5_4_NanoOptions>;

class GPT_5_4_Nano extends BaseChatModel {
  constructor(options: GPT_5_4_NanoOptionsType) {
    super(GPT_5_4_NanoSchema, options);
  }
}

export { GPT_5_4_Nano, GPT_5_4_NanoLiteral, GPT_5_4_NanoOptions, GPT_5_4_NanoSchema, type GPT_5_4_NanoOptionsType };
