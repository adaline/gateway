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

const GPT_3_5_Turbo_0125Literal = "gpt-3.5-turbo-0125";
const GPT_3_5_Turbo_0125Description =
  "The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats and a fix for a bug which caused a \
  text encoding issue for non-English language function calls. Training data up to Sept 2021.";

const GPT_3_5_Turbo_0125Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_3_5_Turbo_0125Literal,
  description: GPT_3_5_Turbo_0125Description,
  maxInputTokens: 4092,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(4092, 4).schema,
  },
});

const GPT_3_5_Turbo_0125Options = BaseChatModelOptions;
type GPT_3_5_Turbo_0125OptionsType = z.infer<typeof GPT_3_5_Turbo_0125Options>;

class GPT_3_5_Turbo_0125 extends BaseChatModel {
  constructor(options: GPT_3_5_Turbo_0125OptionsType) {
    super(GPT_3_5_Turbo_0125Schema, options);
  }
}

export {
  GPT_3_5_Turbo_0125,
  GPT_3_5_Turbo_0125Options,
  GPT_3_5_Turbo_0125Schema,
  GPT_3_5_Turbo_0125Literal,
  type GPT_3_5_Turbo_0125OptionsType,
};
