import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4_1_NanoLiteral = "gpt-4.1-nano";
const GPT_4_1_NanoDescription =
  "Fastest, most cost-effective GPT-4.1 model. \
  Training data up to May 2024.";

const GPT_4_1_NanoSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4_1_NanoLiteral,
  description: GPT_4_1_NanoDescription,
  maxInputTokens: 1047576,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(32768, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(32768, 4).schema,
  },
  price: pricingData[GPT_4_1_NanoLiteral],
});

const GPT_4_1_NanoOptions = BaseChatModelOptions;
type GPT_4_1_NanoOptionsType = z.infer<typeof GPT_4_1_NanoOptions>;

class GPT_4_1_Nano extends BaseChatModel {
  constructor(options: GPT_4_1_NanoOptionsType) {
    super(GPT_4_1_NanoSchema, options);
  }
}

export { GPT_4_1_Nano, GPT_4_1_NanoLiteral, GPT_4_1_NanoOptions, GPT_4_1_NanoSchema, type GPT_4_1_NanoOptionsType };
