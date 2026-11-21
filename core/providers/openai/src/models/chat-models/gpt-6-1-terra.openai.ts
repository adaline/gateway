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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6.1-terra (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_1_TerraLiteral = "gpt-6.1-terra";
const GPT_6_1_TerraDescription =
  "Fast, efficient model for visual reasoning, precise computer use, and clear, natural writing. \
  Knowledge cutoff: June 1, 2026.";

const GPT_6_1_TerraSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_1_TerraLiteral,
  description: GPT_6_1_TerraDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_1_TerraLiteral],
});

const GPT_6_1_TerraOptions = BaseChatModelOptions;
type GPT_6_1_TerraOptionsType = z.infer<typeof GPT_6_1_TerraOptions>;

/**
 * GPT-6.1 Terra Model
 *
 * "Tool calling requires the Responses API" (model page), so this model is always routed to /v1/responses.
 */
class GPT_6_1_Terra extends BaseChatModel {
  constructor(options: GPT_6_1_TerraOptionsType) {
    super(GPT_6_1_TerraSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_1_Terra, GPT_6_1_TerraLiteral, GPT_6_1_TerraOptions, GPT_6_1_TerraSchema, type GPT_6_1_TerraOptionsType };
