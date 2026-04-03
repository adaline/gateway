import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelRoles, OpenAIChatModelRolesMap, OpenAIChatModelWebSearchModalities, OpenAIChatModelWebSearchModalitiesEnum } from "./types";

const GPT_4o_Search_PreviewLiteral = "gpt-4o-search-preview";
const GPT_4o_Search_PreviewDescription =
  "GPT-4o model optimized for web search. Retrieves information from the web before responding to queries. \
  Training data up to Oct 2023.";

const GPT_4o_Search_PreviewSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWebSearchModalitiesEnum).parse({
  name: GPT_4o_Search_PreviewLiteral,
  description: GPT_4o_Search_PreviewDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.webSearch(16384, 4).def,
    schema: OpenAIChatModelConfigs.webSearch(16384, 4).schema,
  },
  price: pricingData[GPT_4o_Search_PreviewLiteral],
});

const GPT_4o_Search_PreviewOptions = BaseChatModelOptions;
type GPT_4o_Search_PreviewOptionsType = z.infer<typeof GPT_4o_Search_PreviewOptions>;

class GPT_4o_Search_Preview extends BaseChatModel {
  constructor(options: GPT_4o_Search_PreviewOptionsType) {
    super(GPT_4o_Search_PreviewSchema, options);
  }
}

export {
  GPT_4o_Search_Preview,
  GPT_4o_Search_PreviewLiteral,
  GPT_4o_Search_PreviewOptions,
  GPT_4o_Search_PreviewSchema,
  type GPT_4o_Search_PreviewOptionsType,
};
