import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4o_Mini_2024_07_18Literal = "gpt-4o-mini-2024-07-18";
const GPT_4o_MiniDescription =
  "Most advanced, multimodal flagship model that is cheaper and faster than GPT-4 Turbo. Currently points to gpt-4o-2024-05-13. \
  Training data up to Oct 2023.";

const GPT_4o_Mini_2024_07_18Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4o_Mini_2024_07_18Literal,
  description: GPT_4o_MiniDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseSchema(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseSchema(4092, 4).schema,
  },
});

const GPT_4o_Mini_2024_07_18Options = BaseChatModelOptions;
type GPT_4o_Mini_2024_07_18OptionsType = z.infer<typeof GPT_4o_Mini_2024_07_18Options>;

class GPT_4o_Mini_2024_07_18 extends BaseChatModel {
  constructor(options: GPT_4o_Mini_2024_07_18OptionsType) {
    super(GPT_4o_Mini_2024_07_18Schema, options);
  }
}

export {
  GPT_4o_Mini_2024_07_18,
  GPT_4o_Mini_2024_07_18Options,
  GPT_4o_Mini_2024_07_18Schema,
  GPT_4o_Mini_2024_07_18Literal,
  type GPT_4o_Mini_2024_07_18OptionsType,
};
