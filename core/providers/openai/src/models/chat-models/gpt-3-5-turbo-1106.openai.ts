import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "./types";

const GPT_3_5_Turbo_1106Literal = "gpt-3.5-turbo-1106";
const GPT_3_5_Turbo_1106Description =
  "The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.\
   Returns a maximum of 4,096 output tokens. Training data up to Sept 2021.";

const GPT_3_5_Turbo_1106Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_3_5_Turbo_1106Literal,
  description: GPT_3_5_Turbo_1106Description,
  maxInputTokens: 4092,
  maxOutputTokens: 16385,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(16385, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(16385, 4).schema,
  },
});

const GPT_3_5_Turbo_1106Options = BaseChatModelOptions;
type GPT_3_5_Turbo_1106OptionsType = z.infer<typeof GPT_3_5_Turbo_1106Options>;

class GPT_3_5_Turbo_1106 extends BaseChatModel {
  constructor(options: GPT_3_5_Turbo_1106OptionsType) {
    super(GPT_3_5_Turbo_1106Schema, options);
  }
}

export {
  GPT_3_5_Turbo_1106,
  GPT_3_5_Turbo_1106Options,
  GPT_3_5_Turbo_1106Schema,
  GPT_3_5_Turbo_1106Literal,
  type GPT_3_5_Turbo_1106OptionsType,
};
