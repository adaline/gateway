import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelWebSearchModalities,
  OpenAIChatModelWebSearchModalitiesEnum,
} from "./types";

const GPT_4o_Mini_Search_Preview_2025_03_11Literal = "gpt-4o-mini-search-preview-2025-03-11";
const GPT_4o_Mini_Search_Preview_2025_03_11Description =
  "GPT-4o Mini model optimized for web search (March 2025 snapshot). A smaller, faster model that retrieves information from the web before responding. \
  Training data up to Oct 2023.";

const GPT_4o_Mini_Search_Preview_2025_03_11Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWebSearchModalitiesEnum).parse({
  name: GPT_4o_Mini_Search_Preview_2025_03_11Literal,
  description: GPT_4o_Mini_Search_Preview_2025_03_11Description,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(16384, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(16384, 4).schema,
  },
  price: pricingData[GPT_4o_Mini_Search_Preview_2025_03_11Literal],
});

const GPT_4o_Mini_Search_Preview_2025_03_11Options = BaseChatModelOptions;
type GPT_4o_Mini_Search_Preview_2025_03_11OptionsType = z.infer<typeof GPT_4o_Mini_Search_Preview_2025_03_11Options>;

class GPT_4o_Mini_Search_Preview_2025_03_11 extends BaseChatModel {
  constructor(options: GPT_4o_Mini_Search_Preview_2025_03_11OptionsType) {
    super(GPT_4o_Mini_Search_Preview_2025_03_11Schema, options);
  }
}

export {
  GPT_4o_Mini_Search_Preview_2025_03_11,
  GPT_4o_Mini_Search_Preview_2025_03_11Literal,
  GPT_4o_Mini_Search_Preview_2025_03_11Options,
  GPT_4o_Mini_Search_Preview_2025_03_11Schema,
  type GPT_4o_Mini_Search_Preview_2025_03_11OptionsType,
};
