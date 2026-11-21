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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6.2-astra (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_2_AstraLiteral = "gpt-6.2-astra";
const GPT_6_2_AstraDescription =
  "Most capable GPT-6.2 model for the hardest long-running projects: builds and revises software, operates a computer, and works with documents. \
  Knowledge cutoff: May 18, 2026.";

const GPT_6_2_AstraSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_2_AstraLiteral,
  description: GPT_6_2_AstraDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6LowToMaxWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6LowToMaxWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_2_AstraLiteral],
});

const GPT_6_2_AstraOptions = BaseChatModelOptions;
type GPT_6_2_AstraOptionsType = z.infer<typeof GPT_6_2_AstraOptions>;

/**
 * GPT-6.2 Astra Model
 *
 * Tool calling on gpt-6.2-astra requires the Responses API, so this model is always routed to /v1/responses.
 */
class GPT_6_2_Astra extends BaseChatModel {
  constructor(options: GPT_6_2_AstraOptionsType) {
    super(GPT_6_2_AstraSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_2_Astra, GPT_6_2_AstraLiteral, GPT_6_2_AstraOptions, GPT_6_2_AstraSchema, type GPT_6_2_AstraOptionsType };
