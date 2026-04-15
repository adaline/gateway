import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelResponsesApi, BaseChatModelResponsesApiOptions } from "./base-chat-model-responses-api.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.4-pro (retrieved 2026-04-15)
const GPT_5_4_ProLiteral = "gpt-5.4-pro";
const GPT_5_4_ProDescription =
  "Default version of GPT-5.4 that produces smarter and more precise responses by allocating additional compute for complex reasoning. \
  Training data up to August 2025. Available via the OpenAI Responses API only for multi-turn reasoning support.";

const GPT_5_4_ProSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_4_ProLiteral,
  description: GPT_5_4_ProDescription,
  maxInputTokens: 1050000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5Pro(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5Pro(128000, 4).schema,
  },
  price: pricingData[GPT_5_4_ProLiteral],
});

const GPT_5_4_ProOptions = BaseChatModelResponsesApiOptions;
type GPT_5_4_ProOptionsType = z.infer<typeof GPT_5_4_ProOptions>;

/**
 * GPT-5.4 Pro Model
 *
 * This model uses the OpenAI Responses API (/v1/responses)
 */
class GPT_5_4_Pro extends BaseChatModelResponsesApi {
  constructor(options: GPT_5_4_ProOptionsType) {
    super(GPT_5_4_ProSchema, options);
  }
}

export { GPT_5_4_Pro, GPT_5_4_ProLiteral, GPT_5_4_ProOptions, GPT_5_4_ProSchema, type GPT_5_4_ProOptionsType };
