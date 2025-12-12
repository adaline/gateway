import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelModalities,
  OpenAIChatModelModalitiesEnum,
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
} from "./types";

const GPT_5_2_ChatLatestLiteral = "gpt-5.2-chat-latest";
const GPT_5_2_ChatLatestDescription =
  "Latest GPT-5.2 chat-optimized model for conversational workloads with tool/function calling support. \
  Training data up to January 2025.";

const GPT_5_2_ChatLatestModalities = OpenAIChatModelModalities;
const GPT_5_2_ChatLatestModalitiesEnum = OpenAIChatModelModalitiesEnum;

const GPT_5_2_ChatLatestSchema = ChatModelSchema(OpenAIChatModelRoles, GPT_5_2_ChatLatestModalitiesEnum).parse({
  name: GPT_5_2_ChatLatestLiteral,
  description: GPT_5_2_ChatLatestDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: GPT_5_2_ChatLatestModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData[GPT_5_2_ChatLatestLiteral],
});

const GPT_5_2_ChatLatestOptions = BaseChatModelOptions;
type GPT_5_2_ChatLatestOptionsType = z.infer<typeof GPT_5_2_ChatLatestOptions>;

class GPT_5_2_ChatLatest extends BaseChatModel {
  constructor(options: GPT_5_2_ChatLatestOptionsType) {
    super(GPT_5_2_ChatLatestSchema, options);
  }
}

export {
  GPT_5_2_ChatLatest,
  GPT_5_2_ChatLatestLiteral,
  GPT_5_2_ChatLatestOptions,
  GPT_5_2_ChatLatestSchema,
  type GPT_5_2_ChatLatestOptionsType
};
