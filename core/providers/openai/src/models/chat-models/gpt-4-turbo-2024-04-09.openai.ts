import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4_Turbo_2024_04_09Literal = "gpt-4-turbo-2024-04-09";
const GPT_4_Turbo_2024_04_09Description =
  "GPT-4 Turbo with Vision model. Vision requests can now use JSON mode and function calling. gpt-4-turbo currently points to this version. \
  Training data up to Dec 2023.";

const GPT_4_Turbo_2024_04_09Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4_Turbo_2024_04_09Literal,
  description: GPT_4_Turbo_2024_04_09Description,
  maxInputTokens: 128000,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(4096, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(4096, 4).schema,
  },
});

const GPT_4_Turbo_2024_04_09Options = BaseChatModelOptions;
type GPT_4_Turbo_2024_04_09OptionsType = z.infer<typeof GPT_4_Turbo_2024_04_09Options>;

class GPT_4_Turbo_2024_04_09 extends BaseChatModel {
  constructor(options: GPT_4_Turbo_2024_04_09OptionsType) {
    super(GPT_4_Turbo_2024_04_09Schema, options);
  }
}

export {
  GPT_4_Turbo_2024_04_09,
  GPT_4_Turbo_2024_04_09Options,
  GPT_4_Turbo_2024_04_09Schema,
  GPT_4_Turbo_2024_04_09Literal,
  type GPT_4_Turbo_2024_04_09OptionsType,
};
