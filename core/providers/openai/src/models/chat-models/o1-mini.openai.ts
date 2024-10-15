import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModelOptions } from "./base-chat-model.openai";
import { BaseOSeriesChatModel } from "./base-o-series-chat-model.openai";
import {
  OpenAIChatModelOSSeriesRoles,
  OpenAIChatModelOSSeriesRolesMap,
  OpenAIChatModelTextModalities,
  OpenAIChatModelTextModalitiesEnum,
} from "./types";

const O1_MiniLiteral = "o1-mini";
const O1_MiniDescription =
  "Faster and cheaper reasoning model particularly good at coding, math, and science. Training data up to Oct 2023.";

const O1_MiniSchema = ChatModelSchema(OpenAIChatModelOSSeriesRoles, OpenAIChatModelTextModalitiesEnum).parse({
  name: O1_MiniLiteral,
  description: O1_MiniDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelOSSeriesRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(4092, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(4092, 4).schema,
  },
});

const O1_MiniOptions = BaseChatModelOptions;
type O1_MiniOptionsType = z.infer<typeof O1_MiniOptions>;

class O1_Mini extends BaseOSeriesChatModel {
  constructor(options: O1_MiniOptionsType) {
    super(O1_MiniSchema, options);
  }
}

export { O1_Mini, O1_MiniOptions, O1_MiniSchema, O1_MiniLiteral, type O1_MiniOptionsType };
