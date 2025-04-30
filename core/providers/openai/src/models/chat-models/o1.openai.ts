import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModel } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const O1Literal = "o1";
const O1Description =
  "Highly capable general-purpose reasoning model with advanced capabilities in language, coding, and reasoning. Training data up to Oct 2023.";

const O1Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: O1Literal,
  description: O1Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
  price: pricingData[O1Literal],
});

const O1Options = BaseChatModelOptions;
type O1OptionsType = z.infer<typeof O1Options>;

class O1 extends BaseChatModel {
  constructor(options: O1OptionsType) {
    super(O1Schema, options);
  }
}

export { O1, O1Literal, O1Options, O1Schema, type O1OptionsType };
