import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_5_2Literal = "gpt-5.2";
const GPT_5_2Description =
  "Flagship GPT-5.2 model with enhanced reasoning controls and extended knowledge coverage. \
  Training data up to January 2025.";

const GPT_5_2Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_2Literal,
  description: GPT_5_2Description,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData[GPT_5_2Literal],
});

const GPT_5_2Options = BaseChatModelOptions;
type GPT_5_2OptionsType = z.infer<typeof GPT_5_2Options>;

class GPT_5_2 extends BaseChatModel {
  constructor(options: GPT_5_2OptionsType) {
    super(GPT_5_2Schema, options);
  }
}

export { GPT_5_2, GPT_5_2Literal, GPT_5_2Options, GPT_5_2Schema, type GPT_5_2OptionsType };
