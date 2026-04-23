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

const GPT_5_ChatLatestLiteral = "gpt-5-chat-latest";
const GPT_5_ChatLatestDescription =
  "Latest GPT-5 model optimized for conversational use. Does not support function calling or structured outputs. \
  Training data up to October 2024.";

const GPT_5_ChatLatestSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_ChatLatestLiteral,
  description: GPT_5_ChatLatestDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5WithWebSearch(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5WithWebSearch(131072, 4).schema,
  },
  price: pricingData[GPT_5_ChatLatestLiteral],
});

const GPT_5_ChatLatestOptions = BaseChatModelOptions;
type GPT_5_ChatLatestOptionsType = z.infer<typeof GPT_5_ChatLatestOptions>;

class GPT_5_ChatLatest extends BaseChatModel {
  constructor(options: GPT_5_ChatLatestOptionsType) {
    super(GPT_5_ChatLatestSchema, options);
  }
}

export { GPT_5_ChatLatest, GPT_5_ChatLatestLiteral, GPT_5_ChatLatestOptions, GPT_5_ChatLatestSchema, type GPT_5_ChatLatestOptionsType };
