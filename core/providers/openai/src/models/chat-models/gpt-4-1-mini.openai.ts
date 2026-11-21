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

const GPT_4_1_MiniLiteral = "gpt-4.1-mini";
const GPT_4_1_MiniDescription =
  "Provides a balance between intelligence, speed, and cost that makes it an attractive model for many use cases. \
  Knowledge cutoff: June 1, 2024. Default snapshot deprecated by OpenAI; scheduled shutdown 2027-01-14 (replacement: gpt-6-luna).";

const GPT_4_1_MiniSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_4_1_MiniLiteral,
  description: GPT_4_1_MiniDescription,
  maxInputTokens: 1047576,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchemaWithWebSearch(32768, 4).def,
    schema: OpenAIChatModelConfigs.responseSchemaWithWebSearch(32768, 4).schema,
  },
  price: pricingData[GPT_4_1_MiniLiteral],
});

const GPT_4_1_MiniOptions = BaseChatModelOptions;
type GPT_4_1_MiniOptionsType = z.infer<typeof GPT_4_1_MiniOptions>;

class GPT_4_1_Mini extends BaseChatModel {
  constructor(options: GPT_4_1_MiniOptionsType) {
    super(GPT_4_1_MiniSchema, options);
  }
}

export { GPT_4_1_Mini, GPT_4_1_MiniLiteral, GPT_4_1_MiniOptions, GPT_4_1_MiniSchema, type GPT_4_1_MiniOptionsType };
