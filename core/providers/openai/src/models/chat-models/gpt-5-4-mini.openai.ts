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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.4-mini (retrieved 2026-04-13)
const GPT_5_4_MiniLiteral = "gpt-5.4-mini";
const GPT_5_4_MiniDescription =
  "Faster, more efficient GPT-5.4 mini model for coding, computer use, and subagents in high-volume workloads. \
  Training data up to August 2025.";

const GPT_5_4_MiniSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_4_MiniLiteral,
  description: GPT_5_4_MiniDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_4_MiniLiteral],
});

const GPT_5_4_MiniOptions = BaseChatModelOptions;
type GPT_5_4_MiniOptionsType = z.infer<typeof GPT_5_4_MiniOptions>;

class GPT_5_4_Mini extends BaseChatModel {
  constructor(options: GPT_5_4_MiniOptionsType) {
    super(GPT_5_4_MiniSchema, options);
  }
}

export { GPT_5_4_Mini, GPT_5_4_MiniLiteral, GPT_5_4_MiniOptions, GPT_5_4_MiniSchema, type GPT_5_4_MiniOptionsType };
