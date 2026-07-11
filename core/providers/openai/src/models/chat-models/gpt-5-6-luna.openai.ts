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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.6-luna (retrieved 2026-07-10)
const GPT_5_6_LunaLiteral = "gpt-5.6-luna";
const GPT_5_6_LunaDescription =
  "GPT-5.6 model optimized for cost-sensitive, high-volume workloads, with native computer-use, agentic, coding, and reasoning \
  capabilities. Training data up to February 2026.";

const GPT_5_6_LunaSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_6_LunaLiteral,
  description: GPT_5_6_LunaDescription,
  maxInputTokens: 1050000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_6_LunaLiteral],
});

const GPT_5_6_LunaOptions = BaseChatModelOptions;
type GPT_5_6_LunaOptionsType = z.infer<typeof GPT_5_6_LunaOptions>;

class GPT_5_6_Luna extends BaseChatModel {
  constructor(options: GPT_5_6_LunaOptionsType) {
    super(GPT_5_6_LunaSchema, options);
  }
}

export { GPT_5_6_Luna, GPT_5_6_LunaLiteral, GPT_5_6_LunaOptions, GPT_5_6_LunaSchema, type GPT_5_6_LunaOptionsType };
