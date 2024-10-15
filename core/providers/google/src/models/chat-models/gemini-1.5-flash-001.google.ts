import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini1_5Flash001Literal = "gemini-1.5-flash-001";
const Gemini1_5Flash001Description =
  "Google's fastest, most cost-efficient multimodal model with great performance for high-frequency tasks. \
  Optimized for fast and versatile performance across a diverse variety of tasks";

const Gemini1_5Flash001Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini1_5Flash001Literal,
  description: Gemini1_5Flash001Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.c1(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini1_5Flash001Options = BaseChatModelOptions;
type Gemini1_5Flash001OptionsType = z.infer<typeof Gemini1_5Flash001Options>;

class Gemini1_5Flash001 extends BaseChatModel {
  constructor(options: Gemini1_5Flash001OptionsType) {
    super(Gemini1_5Flash001Schema, options);
  }
}

export {
  Gemini1_5Flash001,
  Gemini1_5Flash001Options,
  Gemini1_5Flash001Schema,
  Gemini1_5Flash001Literal,
  type Gemini1_5Flash001OptionsType,
};
