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

const GeminiProLiteral = "gemini-pro";
const GeminiProDescription =
  "A model for scaling across a wide range of tasks \
  Optimized for natural language tasks, multi-turn text and code chat, and code generation";

const GeminiProSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextToolModalitiesEnum).parse({
  name: GeminiProLiteral,
  description: GeminiProDescription,
  maxInputTokens: 30720,
  maxOutputTokens: 2048,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextToolModalities,
  config: {
    def: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).def,
    schema: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).schema,
  },
});

const GeminiProOptions = BaseChatModelOptions;
type GeminiProOptionsType = z.infer<typeof GeminiProOptions>;

class GeminiPro extends BaseChatModelGemini1 {
  constructor(options: GeminiProOptionsType) {
    super(GeminiProSchema, options);
  }
}

export { GeminiPro, GeminiProOptions, GeminiProSchema, GeminiProLiteral, type GeminiProOptionsType };
