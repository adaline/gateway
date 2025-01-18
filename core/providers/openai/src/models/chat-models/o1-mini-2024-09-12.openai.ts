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

const O1_Mini_2024_09_12Literal = "o1-mini-2024-09-12";
const O1_Mini_2024_09_12Description =
  "Enhanced version of o1-mini optimized for faster reasoning in coding, math, and science. Training data up to September 2024.";

const O1_Mini_2024_09_12Schema = ChatModelSchema(OpenAIChatModelOSSeriesRoles, OpenAIChatModelTextModalitiesEnum).parse({
  name: O1_Mini_2024_09_12Literal,
  description: O1_Mini_2024_09_12Description,
  maxInputTokens: 128000,
  maxOutputTokens: 65536,
  roles: OpenAIChatModelOSSeriesRolesMap,
  modalities: OpenAIChatModelTextModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(65536, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(65536, 4).schema,
  },
});

const O1_Mini_2024_09_12Options = BaseChatModelOptions;
type O1_Mini_2024_09_12OptionsType = z.infer<typeof O1_Mini_2024_09_12Options>;

class O1_Mini_2024_09_12 extends BaseOSeriesChatModel {
  constructor(options: O1_Mini_2024_09_12OptionsType) {
    super(O1_Mini_2024_09_12Schema, options);
  }
}

export {
  O1_Mini_2024_09_12,
  O1_Mini_2024_09_12Literal,
  O1_Mini_2024_09_12Options,
  O1_Mini_2024_09_12Schema,
  type O1_Mini_2024_09_12OptionsType,
};
