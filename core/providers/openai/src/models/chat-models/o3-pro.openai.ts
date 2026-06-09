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

// Specs reference: https://developers.openai.com/api/docs/models/o3-pro (retrieved 2026-06-09)
const O3ProLiteral = "o3-pro";
const O3ProDescription =
  "Version of o3 that uses more compute for the most reliable responses on math, science, coding, and visual reasoning tasks. \
  Training data up to Jun 2024. Available via the OpenAI Responses API only.";

const O3ProSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: O3ProLiteral,
  description: O3ProDescription,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeriesWithWebSearch(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeriesWithWebSearch(100000, 4).schema,
  },
  price: pricingData[O3ProLiteral],
});

const O3ProOptions = BaseChatModelOptions;
type O3ProOptionsType = z.infer<typeof O3ProOptions>;

/**
 * o3-pro Model
 *
 * This model uses the OpenAI Responses API (/v1/responses)
 */
class O3Pro extends BaseChatModel {
  constructor(options: O3ProOptionsType) {
    super(O3ProSchema, { ...options, forceResponsesApi: true });
  }
}

export { O3Pro, O3ProLiteral, O3ProOptions, O3ProSchema, type O3ProOptionsType };
