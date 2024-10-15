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

const GPT_4_1106_PreviewLiteral = "gpt-4-1106-preview";
const GPT_4_1106_PreviewDescription =
  "GPT-4 Turbo model featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. \
  Returns a maximum of 4,096 output tokens. This preview model is not yet suited for production traffic. Training data up to Apr 2023.";

const GPT_4_1106_PreviewSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_4_1106_PreviewLiteral,
  description: GPT_4_1106_PreviewDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.base(4092, 4).def,
    schema: OpenAIChatModelConfigs.base(4092, 4).schema,
  },
});

const GPT_4_1106_PreviewOptions = BaseChatModelOptions;
type GPT_4_1106_PreviewOptionsType = z.infer<typeof GPT_4_1106_PreviewOptions>;

class GPT_4_1106_Preview extends BaseChatModel {
  constructor(options: GPT_4_1106_PreviewOptionsType) {
    super(GPT_4_1106_PreviewSchema, options);
  }
}

export {
  GPT_4_1106_Preview,
  GPT_4_1106_PreviewOptions,
  GPT_4_1106_PreviewSchema,
  GPT_4_1106_PreviewLiteral,
  type GPT_4_1106_PreviewOptionsType,
};
