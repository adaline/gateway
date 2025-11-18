import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_5_1Literal = "gpt-5.1";
const GPT_5_1Description =
  "Latest flagship GPT-5.1 model for coding and agentic tasks with configurable reasoning effort. \
  Training data up to September 2024.";

const GPT_5_1Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_1Literal,
  description: GPT_5_1Description,
  maxInputTokens: 400000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(128000, 4).schema,
  },
  price: pricingData[GPT_5_1Literal],
});

const GPT_5_1Options = BaseChatModelOptions;
type GPT_5_1OptionsType = z.infer<typeof GPT_5_1Options>;

class GPT_5_1 extends BaseChatModel {
  constructor(options: GPT_5_1OptionsType) {
    super(GPT_5_1Schema, options);
  }
}

export { GPT_5_1, GPT_5_1Literal, GPT_5_1Options, GPT_5_1Schema, type GPT_5_1OptionsType };
