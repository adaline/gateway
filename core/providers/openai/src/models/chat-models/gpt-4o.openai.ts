import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4oLiteral = "gpt-4o";
const GPT_4oDescription =
  "Most advanced, multimodal flagship model that is cheaper and faster than GPT-4 Turbo. Currently points to gpt-4o-2024-05-13. \
  Training data up to Oct 2023.";

const GPT_4oSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4oLiteral,
  description: GPT_4oDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(4092, 4).schema,
  },
  price: pricingData[GPT_4oLiteral],
});

const GPT_4oOptions = BaseChatModelOptions;
type GPT_4oOptionsType = z.infer<typeof GPT_4oOptions>;

class GPT_4o extends BaseChatModel {
  constructor(options: GPT_4oOptionsType) {
    super(GPT_4oSchema, options);
  }
}

export { GPT_4o, GPT_4oLiteral, GPT_4oOptions, GPT_4oSchema, type GPT_4oOptionsType };
