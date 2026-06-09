import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelProWithWebSearchModalities,
  OpenAIChatModelProWithWebSearchModalitiesEnum,
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
} from "./types";

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5-pro (retrieved 2026-06-09)
const GPT_5_ProLiteral = "gpt-5-pro";
const GPT_5_ProDescription =
  "GPT-5 Pro reasoning variant that allocates additional compute for the most reliable, in-depth answers on complex tasks. \
  Training data up to September 2024. Available via the OpenAI Responses API only.";

const GPT_5_ProSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelProWithWebSearchModalitiesEnum).parse({
  name: GPT_5_ProLiteral,
  description: GPT_5_ProDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelProWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5ProWithWebSearch(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5ProWithWebSearch(131072, 4).schema,
  },
  price: pricingData[GPT_5_ProLiteral],
});

const GPT_5_ProOptions = BaseChatModelOptions;
type GPT_5_ProOptionsType = z.infer<typeof GPT_5_ProOptions>;

/**
 * GPT-5 Pro Model
 *
 * This model uses the OpenAI Responses API (/v1/responses)
 */
class GPT_5_Pro extends BaseChatModel {
  constructor(options: GPT_5_ProOptionsType) {
    super(GPT_5_ProSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_5_Pro, GPT_5_ProLiteral, GPT_5_ProOptions, GPT_5_ProSchema, type GPT_5_ProOptionsType };
