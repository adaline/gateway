import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_5_NanoLiteral = "gpt-5-nano";
const GPT_5_NanoDescription =
  "Most cost-effective GPT-5 model optimized for speed and efficiency. \
  Training data up to October 2024.";

const GPT_5_NanoSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_NanoLiteral,
  description: GPT_5_NanoDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(131072, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(131072, 4).schema,
  },
  price: pricingData[GPT_5_NanoLiteral],
});

const GPT_5_NanoOptions = BaseChatModelOptions;
type GPT_5_NanoOptionsType = z.infer<typeof GPT_5_NanoOptions>;

class GPT_5_Nano extends BaseChatModel {
  constructor(options: GPT_5_NanoOptionsType) {
    super(GPT_5_NanoSchema, options);
  }
}

export { GPT_5_Nano, GPT_5_NanoLiteral, GPT_5_NanoOptions, GPT_5_NanoSchema, type GPT_5_NanoOptionsType };
