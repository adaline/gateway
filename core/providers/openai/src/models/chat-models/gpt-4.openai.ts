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

const GPT_4Literal = "gpt-4";
const GPT_4Description = "Currently points to gpt-4-0613. Training data up to Sept 2021.";

const GPT_4Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_4Literal,
  description: GPT_4Description,
  maxInputTokens: 8192,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.base(4092, 4).def,
    schema: OpenAIChatModelConfigs.base(4092, 4).schema,
  },
});

const GPT_4Options = BaseChatModelOptions;
type GPT_4OptionsType = z.infer<typeof GPT_4Options>;

class GPT_4 extends BaseChatModel {
  constructor(options: GPT_4OptionsType) {
    super(GPT_4Schema, options);
  }
}

export { GPT_4, GPT_4Options, GPT_4Schema, GPT_4Literal, type GPT_4OptionsType };
