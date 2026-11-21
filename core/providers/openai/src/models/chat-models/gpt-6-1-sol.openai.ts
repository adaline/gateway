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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6.1-sol (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_1_SolLiteral = "gpt-6.1-sol";
const GPT_6_1_SolDescription =
  "Near-Astra performance for complex work at a lower cost. \
  Knowledge cutoff: April 30, 2026.";

const GPT_6_1_SolSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_1_SolLiteral,
  description: GPT_6_1_SolDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6LowToMaxWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6LowToMaxWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_1_SolLiteral],
});

const GPT_6_1_SolOptions = BaseChatModelOptions;
type GPT_6_1_SolOptionsType = z.infer<typeof GPT_6_1_SolOptions>;

/**
 * GPT-6.1 Sol Model
 *
 * Tool calling on gpt-6.1-sol requires the Responses API, so this model is always routed to /v1/responses.
 */
class GPT_6_1_Sol extends BaseChatModel {
  constructor(options: GPT_6_1_SolOptionsType) {
    super(GPT_6_1_SolSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_1_Sol, GPT_6_1_SolLiteral, GPT_6_1_SolOptions, GPT_6_1_SolSchema, type GPT_6_1_SolOptionsType };
