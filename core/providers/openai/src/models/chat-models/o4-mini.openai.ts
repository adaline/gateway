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

const O4_MiniLiteral = "o4-mini";
const O4_MiniDescription =
  "Optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks. Training data up to Jun 2024.";

const O4_MiniSchema = ChatModelSchema(OpenAIChatModelOSSeriesRoles, OpenAIChatModelTextModalitiesEnum).parse({
  name: O4_MiniLiteral,
  description: O4_MiniDescription,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelOSSeriesRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
});

const O4_MiniOptions = BaseChatModelOptions;
type O4_MiniOptionsType = z.infer<typeof O4_MiniOptions>;

class O4_Mini extends BaseOSeriesChatModel {
  constructor(options: O4_MiniOptionsType) {
    super(O4_MiniSchema, options);
  }
}

export { O4_Mini, O4_MiniLiteral, O4_MiniOptions, O4_MiniSchema, type O4_MiniOptionsType };

