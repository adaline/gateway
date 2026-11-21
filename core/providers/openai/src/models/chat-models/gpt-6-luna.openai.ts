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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6-luna (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_LunaLiteral = "gpt-6-luna";
const GPT_6_LunaDescription =
  "Most efficient GPT-6 model for focused, high-volume tasks. \
  Knowledge cutoff: May 18, 2026.";

const GPT_6_LunaSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_LunaLiteral,
  description: GPT_6_LunaDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_LunaLiteral],
});

const GPT_6_LunaOptions = BaseChatModelOptions;
type GPT_6_LunaOptionsType = z.infer<typeof GPT_6_LunaOptions>;

/**
 * GPT-6 Luna Model
 *
 * Chat Completions only supports function calling at reasoning effort 'none'. The model is routed to
 * /v1/responses unconditionally, for consistency with the rest of the GPT-6 family, so tools work at every effort.
 */
class GPT_6_Luna extends BaseChatModel {
  constructor(options: GPT_6_LunaOptionsType) {
    super(GPT_6_LunaSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_Luna, GPT_6_LunaLiteral, GPT_6_LunaOptions, GPT_6_LunaSchema, type GPT_6_LunaOptionsType };
