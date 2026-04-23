import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelWithWebSearchModalities,
  OpenAIChatModelWithWebSearchModalitiesEnum,
} from "./types";

const O3Literal = "o3";
const O3Description = "A new standard for math, science, coding, and visual reasoning tasks. Training data up to Jun 2024.";

const O3Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: O3Literal,
  description: O3Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeriesWithWebSearch(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeriesWithWebSearch(100000, 4).schema,
  },
});

const O3Options = BaseChatModelOptions;
type O3OptionsType = z.infer<typeof O3Options>;

class O3 extends BaseChatModel {
  constructor(options: O3OptionsType) {
    super(O3Schema, options);
  }
}

export { O3, O3Literal, O3Options, O3Schema, type O3OptionsType };
