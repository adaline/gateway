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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-6-sol (retrieved 2026-11-20)
// 1,050,000 context window (922,000 usable input), 128,000 max output. Text + image in, text out, reasoning.
// Chat Completions, Responses and Batch. Two pricing tiers: >272K input bills the whole request at the higher rate.
const GPT_6_SolLiteral = "gpt-6-sol";
const GPT_6_SolDescription =
  "GPT-6 model built for complex coding and agentic workflows. \
  Knowledge cutoff: April 20, 2026.";

const GPT_6_SolSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_6_SolLiteral,
  description: GPT_6_SolDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_6_SolLiteral],
});

const GPT_6_SolOptions = BaseChatModelOptions;
type GPT_6_SolOptionsType = z.infer<typeof GPT_6_SolOptions>;

/**
 * GPT-6 Sol Model
 *
 * Chat Completions only supports function calling at reasoning effort 'none'. The model is routed to
 * /v1/responses unconditionally, for consistency with the rest of the GPT-6 family, so tools work at every effort.
 */
class GPT_6_Sol extends BaseChatModel {
  constructor(options: GPT_6_SolOptionsType) {
    super(GPT_6_SolSchema, { ...options, forceResponsesApi: true });
  }
}

export { GPT_6_Sol, GPT_6_SolLiteral, GPT_6_SolOptions, GPT_6_SolSchema, type GPT_6_SolOptionsType };
