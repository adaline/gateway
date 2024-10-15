import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5Pro002Literal = "gemini-1.5-pro-002";
const Gemini1_5Pro002Description =
  "Google's best performing multimodal model with features for a wide variety of reasoning tasks. \
  Optimized for complex reasoning tasks requiring more intelligence";

const Gemini1_5Pro002Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5Pro002Literal,
  description: Gemini1_5Pro002Description,
  maxInputTokens: 2000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 40).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 40).schema,
  },
});

const Gemini1_5Pro002Options = BaseChatModelOptions;
type Gemini1_5Pro002OptionsType = z.infer<typeof Gemini1_5Pro002Options>;

class Gemini1_5Pro002 extends BaseChatModel {
  constructor(options: Gemini1_5Pro002OptionsType) {
    super(Gemini1_5Pro002Schema, options);
  }
}

export { Gemini1_5Pro002, Gemini1_5Pro002Options, Gemini1_5Pro002Schema, Gemini1_5Pro002Literal, type Gemini1_5Pro002OptionsType };
