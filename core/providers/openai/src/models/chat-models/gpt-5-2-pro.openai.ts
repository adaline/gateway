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

const GPT_5_2_ProLiteral = "gpt-5.2-pro";
const GPT_5_2_ProDescription =
  "GPT-5.2 Pro available via the OpenAI Responses API for advanced reasoning and agentic workflows. \
  Training data up to January 2025.";

const GPT_5_2_ProSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelProWithWebSearchModalitiesEnum).parse({
  name: GPT_5_2_ProLiteral,
  description: GPT_5_2_ProDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelProWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5ProWithWebSearch(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5ProWithWebSearch(131072, 4).schema,
  },
  price: pricingData[GPT_5_2_ProLiteral],
});

const GPT_5_2_ProOptions = BaseChatModelOptions;
type GPT_5_2_ProOptionsType = z.infer<typeof GPT_5_2_ProOptions>;

/**
 * GPT-5.2 Pro Model
 *
 * This model uses the OpenAI Responses API (/v1/responses)
 */
class GPT_5_2_Pro extends BaseChatModel {
  constructor(options: GPT_5_2_ProOptionsType) {
    super(GPT_5_2_ProSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_5_2_Pro, GPT_5_2_ProLiteral, GPT_5_2_ProOptions, GPT_5_2_ProSchema, type GPT_5_2_ProOptionsType };
