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

const GPT_4_0613Literal = "gpt-4-0613";
const GPT_4_0613Description =
  "Snapshot of gpt-4 from June 13th 2023 with improved function calling support. Training data up to Sept 2021.";

const GPT_4_0613Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_4_0613Literal,
  description: GPT_4_0613Description,
  maxInputTokens: 8192,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.base(4092, 4).def,
    schema: OpenAIChatModelConfigs.base(4092, 4).schema,
  },
});

const GPT_4_0613Options = BaseChatModelOptions;
type GPT_4_0613OptionsType = z.infer<typeof GPT_4_0613Options>;

class GPT_4_0613 extends BaseChatModel {
  constructor(options: GPT_4_0613OptionsType) {
    super(GPT_4_0613Schema, options);
  }
}

export { GPT_4_0613, GPT_4_0613Options, GPT_4_0613Schema, GPT_4_0613Literal, type GPT_4_0613OptionsType };
