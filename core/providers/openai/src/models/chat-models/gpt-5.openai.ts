import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_5Literal = "gpt-5";
const GPT_5Description =
  "Most advanced GPT-5 model for complex reasoning and problem-solving tasks. \
  Training data up to October 2024.";

const GPT_5Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5Literal,
  description: GPT_5Description,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(131072, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(131072, 4).schema,
  },
  price: pricingData[GPT_5Literal],
});

const GPT_5Options = BaseChatModelOptions;
type GPT_5OptionsType = z.infer<typeof GPT_5Options>;

class GPT_5 extends BaseChatModel {
  constructor(options: GPT_5OptionsType) {
    super(GPT_5Schema, options);
  }
}

export { GPT_5, GPT_5Literal, GPT_5Options, GPT_5Schema, type GPT_5OptionsType };
