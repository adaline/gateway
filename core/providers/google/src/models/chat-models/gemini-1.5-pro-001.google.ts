import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5Pro001Literal = "gemini-1.5-pro-001";
const Gemini1_5Pro001Description =
  "Google's best performing multimodal model with features for a wide variety of reasoning tasks. \
  Optimized for complex reasoning tasks requiring more intelligence";

const Gemini1_5Pro001Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5Pro001Literal,
  description: Gemini1_5Pro001Description,
  maxInputTokens: 2000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5Pro001Options = BaseChatModelOptions;
type Gemini1_5Pro001OptionsType = z.infer<typeof Gemini1_5Pro001Options>;

class Gemini1_5Pro001 extends BaseChatModel {
  constructor(options: Gemini1_5Pro001OptionsType) {
    super(Gemini1_5Pro001Schema, options);
  }
}

export { Gemini1_5Pro001, Gemini1_5Pro001Options, Gemini1_5Pro001Schema, Gemini1_5Pro001Literal, type Gemini1_5Pro001OptionsType };
