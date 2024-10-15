import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4o_2024_08_06Literal = "gpt-4o-2024-08-06";
const GPT_4o_2024_08_06Description = "Latest snapshot of gpt-4o that supports Structured Outputs. Training data up to Oct 2023.";

const GPT_4o_2024_08_06Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4o_2024_08_06Literal,
  description: GPT_4o_2024_08_06Description,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(4092, 4).schema,
  },
});

const GPT_4o_2024_08_06Options = BaseChatModelOptions;
type GPT_4o_2024_08_06OptionsType = z.infer<typeof GPT_4o_2024_08_06Options>;

class GPT_4o_2024_08_06 extends BaseChatModel {
  constructor(options: GPT_4o_2024_08_06OptionsType) {
    super(GPT_4o_2024_08_06Schema, options);
  }
}

export {
  GPT_4o_2024_08_06,
  GPT_4o_2024_08_06Options,
  GPT_4o_2024_08_06Schema,
  GPT_4o_2024_08_06Literal,
  type GPT_4o_2024_08_06OptionsType,
};
