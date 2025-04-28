import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const O1_2024_12_17Literal = "o1-2024-12-17";
const O1_2024_12_17Description =
  "A stable release model for production use, offering robust performance and advanced features. Training data up to December 2024.";

const O1_2024_12_17Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: O1_2024_12_17Literal,
  description: O1_2024_12_17Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
  price: pricingData[O1_2024_12_17Literal],
});

const O1_2024_12_17Options = BaseChatModelOptions;
type O1_2024_12_17OptionsType = z.infer<typeof O1_2024_12_17Options>;

class O1_2024_12_17 extends BaseChatModel {
  constructor(options: O1_2024_12_17OptionsType) {
    super(O1_2024_12_17Schema, options);
  }
}

export { O1_2024_12_17, O1_2024_12_17Literal, O1_2024_12_17Options, O1_2024_12_17Schema, type O1_2024_12_17OptionsType };
