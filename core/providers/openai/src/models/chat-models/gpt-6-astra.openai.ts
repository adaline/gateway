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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6-astra (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_AstraLiteral = "gpt-6-astra";
const GPT_6_AstraDescription =
  "GPT-6 reasoning model for complex coding and professional work. \
  Knowledge cutoff: April 30, 2026.";

const GPT_6_AstraSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_AstraLiteral,
  description: GPT_6_AstraDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6AstraWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6AstraWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_AstraLiteral],
});

const GPT_6_AstraOptions = BaseChatModelOptions;
type GPT_6_AstraOptionsType = z.infer<typeof GPT_6_AstraOptions>;

/**
 * GPT-6 Astra Model
 *
 * Tool calling on gpt-6-astra requires the Responses API, so this model is always routed to /v1/responses.
 * Per OpenAI's changelog it does not accept custom temperature, top_p or logprobs (omitted from its config).
 */
class GPT_6_Astra extends BaseChatModel {
  constructor(options: GPT_6_AstraOptionsType) {
    super(GPT_6_AstraSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_Astra, GPT_6_AstraLiteral, GPT_6_AstraOptions, GPT_6_AstraSchema, type GPT_6_AstraOptionsType };
