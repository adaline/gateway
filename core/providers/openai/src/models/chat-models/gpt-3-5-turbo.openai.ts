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

const GPT_3_5_TurboLiteral = "gpt-3.5-turbo";
const GPT_3_5_TurboDescription = "Currently points to gpt-3.5-turbo-0125. Training data up to Sept 2021.";

const GPT_3_5_TurboSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: GPT_3_5_TurboLiteral,
  description: GPT_3_5_TurboDescription,
  maxInputTokens: 4092,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(4092, 4).schema,
  },
});

const GPT_3_5_TurboOptions = BaseChatModelOptions;
type GPT_3_5_TurboOptionsType = z.infer<typeof GPT_3_5_TurboOptions>;

class GPT_3_5_Turbo extends BaseChatModel {
  constructor(options: GPT_3_5_TurboOptionsType) {
    super(GPT_3_5_TurboSchema, options);
  }
}

export { GPT_3_5_Turbo, GPT_3_5_TurboOptions, GPT_3_5_TurboSchema, GPT_3_5_TurboLiteral, type GPT_3_5_TurboOptionsType };
