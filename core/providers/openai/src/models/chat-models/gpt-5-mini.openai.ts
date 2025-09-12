import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_5_MiniLiteral = "gpt-5-mini";
const GPT_5_MiniDescription =
  "Faster, more cost-effective GPT-5 model that balances intelligence and efficiency. \
  Training data up to October 2024.";

const GPT_5_MiniSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_MiniLiteral,
  description: GPT_5_MiniDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData[GPT_5_MiniLiteral],
});

const GPT_5_MiniOptions = BaseChatModelOptions;
type GPT_5_MiniOptionsType = z.infer<typeof GPT_5_MiniOptions>;

class GPT_5_Mini extends BaseChatModel {
  constructor(options: GPT_5_MiniOptionsType) {
    super(GPT_5_MiniSchema, options);
  }
}

export { GPT_5_Mini, GPT_5_MiniLiteral, GPT_5_MiniOptions, GPT_5_MiniSchema, type GPT_5_MiniOptionsType };
