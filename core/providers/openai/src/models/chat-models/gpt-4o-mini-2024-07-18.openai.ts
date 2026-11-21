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

const GPT_4o_Mini_2024_07_18Literal = "gpt-4o-mini-2024-07-18";
const GPT_4o_MiniDescription =
  "Snapshot of gpt-4o-mini, a small, affordable multimodal model for fast, lightweight tasks. Training data up to Oct 2023. \
  Deprecated by OpenAI; scheduled shutdown 2027-01-14 (replacement: gpt-6-luna).";

const GPT_4o_Mini_2024_07_18Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_4o_Mini_2024_07_18Literal,
  description: GPT_4o_MiniDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchemaWithWebSearch(16384, 4).def,
    schema: OpenAIChatModelConfigs.responseSchemaWithWebSearch(16384, 4).schema,
  },
  price: pricingData[GPT_4o_Mini_2024_07_18Literal],
});

const GPT_4o_Mini_2024_07_18Options = BaseChatModelOptions;
type GPT_4o_Mini_2024_07_18OptionsType = z.infer<typeof GPT_4o_Mini_2024_07_18Options>;

class GPT_4o_Mini_2024_07_18 extends BaseChatModel {
  constructor(options: GPT_4o_Mini_2024_07_18OptionsType) {
    super(GPT_4o_Mini_2024_07_18Schema, options);
  }
}

export {
  GPT_4o_Mini_2024_07_18,
  GPT_4o_Mini_2024_07_18Literal,
  GPT_4o_Mini_2024_07_18Options,
  GPT_4o_Mini_2024_07_18Schema,
  type GPT_4o_Mini_2024_07_18OptionsType,
};
