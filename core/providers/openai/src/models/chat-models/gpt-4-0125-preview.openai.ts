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

const GPT_4_0125_PreviewLiteral = "gpt-4-0125-preview";
const GPT_4_0125_PreviewDescription =
  "The latest GPT-4 model intended to reduce cases of “laziness” where the model doesn’t complete a task. Training data up to Apr 2023.";

const GPT_4_0125_PreviewSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_4_0125_PreviewLiteral,
  description: GPT_4_0125_PreviewDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.base(4092, 4).def,
    schema: OpenAIChatModelConfigs.base(4092, 4).schema,
  },
});

const GPT_4_0125_PreviewOptions = BaseChatModelOptions;
type GPT_4_0125_PreviewOptionsType = z.infer<typeof GPT_4_0125_PreviewOptions>;

class GPT_4_0125_Preview extends BaseChatModel {
  constructor(options: GPT_4_0125_PreviewOptionsType) {
    super(GPT_4_0125_PreviewSchema, options);
  }
}

export {
  GPT_4_0125_Preview,
  GPT_4_0125_PreviewOptions,
  GPT_4_0125_PreviewSchema,
  GPT_4_0125_PreviewLiteral,
  type GPT_4_0125_PreviewOptionsType,
};
