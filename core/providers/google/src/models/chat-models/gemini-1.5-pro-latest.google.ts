import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5ProLatestLiteral = "gemini-1.5-pro-latest";
const Gemini1_5ProLatestDescription =
  "Google's best performing multimodal model with features for a wide variety of reasoning tasks. \
  Optimized for complex reasoning tasks requiring more intelligence";

const Gemini1_5ProLatestSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5ProLatestLiteral,
  description: Gemini1_5ProLatestDescription,
  maxInputTokens: 2000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5ProLatestOptions = BaseChatModelOptions;
type Gemini1_5ProLatestOptionsType = z.infer<typeof Gemini1_5ProLatestOptions>;

class Gemini1_5ProLatest extends BaseChatModel {
  constructor(options: Gemini1_5ProLatestOptionsType) {
    super(Gemini1_5ProLatestSchema, options);
  }
}

export {
  Gemini1_5ProLatest,
  Gemini1_5ProLatestOptions,
  Gemini1_5ProLatestSchema,
  Gemini1_5ProLatestLiteral,
  type Gemini1_5ProLatestOptionsType,
};
