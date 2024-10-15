import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5ProLiteral = "gemini-1.5-pro";
const Gemini1_5ProDescription =
  "Google's best performing multimodal model with features for a wide variety of reasoning tasks. \
  Optimized for complex reasoning tasks requiring more intelligence";

const Gemini1_5ProSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5ProLiteral,
  description: Gemini1_5ProDescription,
  maxInputTokens: 2000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5ProOptions = BaseChatModelOptions;
type Gemini1_5ProOptionsType = z.infer<typeof Gemini1_5ProOptions>;

class Gemini1_5Pro extends BaseChatModel {
  constructor(options: Gemini1_5ProOptionsType) {
    super(Gemini1_5ProSchema, options);
  }
}

export { Gemini1_5Pro, Gemini1_5ProOptions, Gemini1_5ProSchema, Gemini1_5ProLiteral, type Gemini1_5ProOptionsType };
