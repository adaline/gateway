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

const GPT_5_Search_ApiLiteral = "gpt-5-search-api";
const GPT_5_Search_ApiDescription =
  "GPT-5 model optimized for web search. Retrieves information from the web before responding to queries.";

const GPT_5_Search_ApiSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWebSearchModalitiesEnum).parse({
  name: GPT_5_Search_ApiLiteral,
  description: GPT_5_Search_ApiDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(16384, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(16384, 4).schema,
  },
  price: pricingData[GPT_5_Search_ApiLiteral],
});

const GPT_5_Search_ApiOptions = BaseChatModelOptions;
type GPT_5_Search_ApiOptionsType = z.infer<typeof GPT_5_Search_ApiOptions>;

class GPT_5_Search_Api extends BaseChatModel {
  constructor(options: GPT_5_Search_ApiOptionsType) {
    super(GPT_5_Search_ApiSchema, options);
  }
}

export { GPT_5_Search_Api, GPT_5_Search_ApiLiteral, GPT_5_Search_ApiOptions, GPT_5_Search_ApiSchema, type GPT_5_Search_ApiOptionsType };
