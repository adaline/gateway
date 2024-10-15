import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4o_2024_05_13Literal = "gpt-4o-2024-05-13";
const GPT_4o_2024_05_13Description = "Latest snapshot of gpt-4o that supports Structured Outputs. Training data up to Oct 2023.";

const GPT_4o_2024_05_13Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4o_2024_05_13Literal,
  description: GPT_4o_2024_05_13Description,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(4092, 4).schema,
  },
});

const GPT_4o_2024_05_13Options = BaseChatModelOptions;
type GPT_4o_2024_05_13OptionsType = z.infer<typeof GPT_4o_2024_05_13Options>;

class GPT_4o_2024_05_13 extends BaseChatModel {
  constructor(options: GPT_4o_2024_05_13OptionsType) {
    super(GPT_4o_2024_05_13Schema, options);
  }
}

export {
  GPT_4o_2024_05_13,
  GPT_4o_2024_05_13Options,
  GPT_4o_2024_05_13Schema,
  GPT_4o_2024_05_13Literal,
  type GPT_4o_2024_05_13OptionsType,
};
