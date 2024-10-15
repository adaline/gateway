import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModelOptions } from "./base-chat-model.google";
import { BaseChatModelGemini1 } from "./base-gemini-1-chat-model.google";
import {
  GoogleChatModelRoles,
  GoogleChatModelRolesMap,
  GoogleChatModelTextToolModalities,
  GoogleChatModelTextToolModalitiesEnum,
} from "./types";

const Gemini1_0ProLatestLiteral = "gemini-1.0-pro-latest";
const Gemini1_0ProLatestDescription =
  "Google's latest multimodal model with great performance for high-frequency tasks. \
  Optimized for natural language tasks, multi-turn text and code chat, and code generation";

const Gemini1_0ProLatestSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextToolModalitiesEnum).parse({
  name: Gemini1_0ProLatestLiteral,
  description: Gemini1_0ProLatestDescription,
  maxInputTokens: 30720,
  maxOutputTokens: 2048,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextToolModalities,
  config: {
    def: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).def,
    schema: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).schema,
  },
});

const Gemini1_0ProLatestOptions = BaseChatModelOptions;
type Gemini1_0ProLatestOptionsType = z.infer<typeof Gemini1_0ProLatestOptions>;

class Gemini1_0ProLatest extends BaseChatModelGemini1 {
  constructor(options: Gemini1_0ProLatestOptionsType) {
    super(Gemini1_0ProLatestSchema, options);
  }
}

export {
  Gemini1_0ProLatest,
  Gemini1_0ProLatestOptions,
  Gemini1_0ProLatestSchema,
  Gemini1_0ProLatestLiteral,
  type Gemini1_0ProLatestOptionsType,
};
