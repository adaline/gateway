import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5FlashLatestLiteral = "gemini-1.5-flash-latest";
const Gemini1_5FlashLatestDescription =
  "Google's latest multimodal model with great performance for high-frequency tasks. \
  Optimized for fast and versatile performance across a diverse variety of tasks";

const Gemini1_5FlashLatestSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5FlashLatestLiteral,
  description: Gemini1_5FlashLatestDescription,
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5FlashLatestOptions = BaseChatModelOptions;
type Gemini1_5FlashLatestOptionsType = z.infer<typeof Gemini1_5FlashLatestOptions>;

class Gemini1_5FlashLatest extends BaseChatModel {
  constructor(options: Gemini1_5FlashLatestOptionsType) {
    super(Gemini1_5FlashLatestSchema, options);
  }
}

export {
  Gemini1_5FlashLatest,
  Gemini1_5FlashLatestOptions,
  Gemini1_5FlashLatestSchema,
  Gemini1_5FlashLatestLiteral,
  type Gemini1_5FlashLatestOptionsType,
};
