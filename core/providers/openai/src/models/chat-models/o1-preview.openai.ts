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

const O1_PreviewLiteral = "o1-preview";
const O1_PreviewDescription = "Reasoning model designed to solve hard problems across domains. Training data up to Oct 2023.";

const O1_PreviewSchema = ChatModelSchema(OpenAIChatModelOSSeriesRoles, OpenAIChatModelTextModalitiesEnum).parse({
  name: O1_PreviewLiteral,
  description: O1_PreviewDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelOSSeriesRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(4092, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(4092, 4).schema,
  },
});

const O1_PreviewOptions = BaseChatModelOptions;
type O1_PreviewOptionsType = z.infer<typeof O1_PreviewOptions>;

class O1_Preview extends BaseOSeriesChatModel {
  constructor(options: O1_PreviewOptionsType) {
    super(O1_PreviewSchema, options);
  }
}

export { O1_Preview, O1_PreviewOptions, O1_PreviewSchema, O1_PreviewLiteral, type O1_PreviewOptionsType };
