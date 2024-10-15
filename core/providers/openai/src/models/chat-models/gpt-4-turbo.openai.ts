import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4_TurboLiteral = "gpt-4-turbo";
const GPT_4_TurboDescription =
  "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. \
  Currently points to gpt-4-turbo-2024-04-09. Training data up to Dec 2023.";

const GPT_4_TurboSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4_TurboLiteral,
  description: GPT_4_TurboDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 4092,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(4092, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(4092, 4).schema,
  },
});

const GPT_4_TurboOptions = BaseChatModelOptions;
type GPT_4_TurboOptionsType = z.infer<typeof GPT_4_TurboOptions>;

class GPT_4_Turbo extends BaseChatModel {
  constructor(options: GPT_4_TurboOptionsType) {
    super(GPT_4_TurboSchema, options);
  }
}

export { GPT_4_Turbo, GPT_4_TurboOptions, GPT_4_TurboSchema, GPT_4_TurboLiteral, type GPT_4_TurboOptionsType };
