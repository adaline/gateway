import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5FlashLiteral = "gemini-1.5-flash";
const Gemini1_5FlashDescription =
  "Google's fastest, most cost-efficient multimodal model with great performance for high-frequency tasks. \
  Optimized for fast and versatile performance across a diverse variety of tasks";

const Gemini1_5FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5FlashLiteral,
  description: Gemini1_5FlashDescription,
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5FlashOptions = BaseChatModelOptions;
type Gemini1_5FlashOptionsType = z.infer<typeof Gemini1_5FlashOptions>;

class Gemini1_5Flash extends BaseChatModel {
  constructor(options: Gemini1_5FlashOptionsType) {
    super(Gemini1_5FlashSchema, options);
  }
}

export { Gemini1_5Flash, Gemini1_5FlashOptions, Gemini1_5FlashSchema, Gemini1_5FlashLiteral, type Gemini1_5FlashOptionsType };
