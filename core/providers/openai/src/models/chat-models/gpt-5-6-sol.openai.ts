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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.6-sol (retrieved 2026-07-29)
// Pricing: a promotional rate of $4/$20 per 1M tokens (>272K: $8/$30) runs until 2026-11-30, and the
// post-promo price is unstated. pricing.json deliberately keeps the standard $5/$30 (>272K: $10/$45);
// re-verify after 2026-11-30.
const GPT_5_6_SolLiteral = "gpt-5.6-sol";
const GPT_5_6_SolDescription =
  "Frontier GPT-5.6 model for complex professional work (aliased as gpt-5.6), with native computer-use, agentic, coding, and \
  reasoning capabilities. Training data up to February 2026.";

const GPT_5_6_SolSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_6_SolLiteral,
  description: GPT_5_6_SolDescription,
  maxInputTokens: 922000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_6_SolLiteral],
});

const GPT_5_6_SolOptions = BaseChatModelOptions;
type GPT_5_6_SolOptionsType = z.infer<typeof GPT_5_6_SolOptions>;

class GPT_5_6_Sol extends BaseChatModel {
  constructor(options: GPT_5_6_SolOptionsType) {
    super(GPT_5_6_SolSchema, options);
  }
}

export { GPT_5_6_Sol, GPT_5_6_SolLiteral, GPT_5_6_SolOptions, GPT_5_6_SolSchema, type GPT_5_6_SolOptionsType };
