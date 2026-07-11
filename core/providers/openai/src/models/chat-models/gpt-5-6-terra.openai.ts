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

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.6-terra (retrieved 2026-07-10)
const GPT_5_6_TerraLiteral = "gpt-5.6-terra";
const GPT_5_6_TerraDescription =
  "GPT-5.6 model that balances intelligence and cost, with native computer-use, agentic, coding, and reasoning capabilities. \
  Training data up to February 2026.";

const GPT_5_6_TerraSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_6_TerraLiteral,
  description: GPT_5_6_TerraDescription,
  maxInputTokens: 1050000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_6WithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_6_TerraLiteral],
});

const GPT_5_6_TerraOptions = BaseChatModelOptions;
type GPT_5_6_TerraOptionsType = z.infer<typeof GPT_5_6_TerraOptions>;

class GPT_5_6_Terra extends BaseChatModel {
  constructor(options: GPT_5_6_TerraOptionsType) {
    super(GPT_5_6_TerraSchema, options);
  }
}

export { GPT_5_6_Terra, GPT_5_6_TerraLiteral, GPT_5_6_TerraOptions, GPT_5_6_TerraSchema, type GPT_5_6_TerraOptionsType };
