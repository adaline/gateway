import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const GPT_4o_MiniLiteral = "gpt-4o-mini";
const GPT_4o_MiniDescription =
  "Most advanced, multimodal flagship model that is cheaper and faster than GPT-4 Turbo. Currently points to gpt-4o-2024-05-13. \
  Training data up to Oct 2023.";

const GPT_4o_MiniSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_4o_MiniLiteral,
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

const GPT_4o_MiniOptions = BaseChatModelOptions;
type GPT_4o_MiniOptionsType = z.infer<typeof GPT_4o_MiniOptions>;

class GPT_4o_Mini extends BaseChatModel {
  constructor(options: GPT_4o_MiniOptionsType) {
    super(GPT_4o_MiniSchema, options);
  }
}

export { GPT_4o_Mini, GPT_4o_MiniOptions, GPT_4o_MiniSchema, GPT_4o_MiniLiteral, type GPT_4o_MiniOptionsType };
