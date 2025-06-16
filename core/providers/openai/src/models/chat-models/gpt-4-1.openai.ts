import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4_1Literal = "gpt-4.1";
const GPT_4_1Description =
  "Flagship model for complex tasks. It is well suited for problem solving across domains. \
  Training data up to May 2024.";

const GPT_4_1Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4_1Literal,
  description: GPT_4_1Description,
  maxInputTokens: 1047576,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(32768, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(32768, 4).schema,
  },
  price: pricingData[GPT_4_1Literal],
});

const GPT_4_1Options = BaseChatModelOptions;
type GPT_4_1OptionsType = z.infer<typeof GPT_4_1Options>;

class GPT_4_1 extends BaseChatModel {
  constructor(options: GPT_4_1OptionsType) {
    super(GPT_4_1Schema, options);
  }
}

export { GPT_4_1, GPT_4_1Literal, GPT_4_1Options, GPT_4_1Schema, type GPT_4_1OptionsType };
