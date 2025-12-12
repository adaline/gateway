import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://platform.openai.com/docs/pricing (retrieved 2025-12-12)
const GPT_5_2_ProLiteral = "gpt-5.2-pro";
const GPT_5_2_ProDescription =
  "GPT-5.2 Pro model with enhanced reasoning capabilities for complex tasks. \
  Training data up to August 2025.";

const GPT_5_2_ProSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_2_ProLiteral,
  description: GPT_5_2_ProDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(128000, 4).schema,
  },
  price: pricingData[GPT_5_2_ProLiteral],
});

const GPT_5_2_ProOptions = BaseChatModelOptions;
type GPT_5_2_ProOptionsType = z.infer<typeof GPT_5_2_ProOptions>;

class GPT_5_2_Pro extends BaseChatModel {
  constructor(options: GPT_5_2_ProOptionsType) {
    super(GPT_5_2_ProSchema, options);
  }
}

export { GPT_5_2_Pro, GPT_5_2_ProLiteral, GPT_5_2_ProOptions, GPT_5_2_ProSchema, type GPT_5_2_ProOptionsType };
