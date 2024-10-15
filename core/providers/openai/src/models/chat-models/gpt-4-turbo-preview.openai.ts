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

const GPT_4_Turbo_PreviewLiteral = "gpt-4-turbo-preview";
const GPT_4_Turbo_PreviewDescription = "Currently points to gpt-4-0125-preview. Training data up to Apr 2023.";

const GPT_4_Turbo_PreviewSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_4_Turbo_PreviewLiteral,
  description: GPT_4_Turbo_PreviewDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(4092, 4).schema,
  },
});

const GPT_4_Turbo_PreviewOptions = BaseChatModelOptions;
type GPT_4_Turbo_PreviewOptionsType = z.infer<typeof GPT_4_Turbo_PreviewOptions>;

class GPT_4_Turbo_Preview extends BaseChatModel {
  constructor(options: GPT_4_Turbo_PreviewOptionsType) {
    super(GPT_4_Turbo_PreviewSchema, options);
  }
}

export {
  GPT_4_Turbo_Preview,
  GPT_4_Turbo_PreviewOptions,
  GPT_4_Turbo_PreviewSchema,
  GPT_4_Turbo_PreviewLiteral,
  type GPT_4_Turbo_PreviewOptionsType,
};
