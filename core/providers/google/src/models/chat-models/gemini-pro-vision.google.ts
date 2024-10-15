import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModelOptions } from "./base-chat-model.google";
import { BaseChatModelGemini1 } from "./base-gemini-1-chat-model.google";
import {
  GoogleChatModelRoles,
  GoogleChatModelRolesMap,
  GoogleChatModelTextVisionModalities,
  GoogleChatModelTextVisionModalitiesEnum,
} from "./types";

const GeminiProVisionLiteral = "gemini-pro-vision";
const GeminiProVisionDescription = "An image understanding model to handle a broad range of applications";

const GeminiProVisionSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextVisionModalitiesEnum).parse({
  name: GeminiProVisionLiteral,
  description: GeminiProVisionDescription,
  maxInputTokens: 12288,
  maxOutputTokens: 4096,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextVisionModalities,
  config: {
    def: GoogleChatModelConfigs.c1(1.0, 0.4, 4096, 4, 1.0, 32).def,
    schema: GoogleChatModelConfigs.c1(1.0, 0.4, 4096, 4, 1.0, 32).schema,
  },
});

const GeminiProVisionOptions = BaseChatModelOptions;
type GeminiProVisionOptionsType = z.infer<typeof GeminiProVisionOptions>;

class GeminiProVision extends BaseChatModelGemini1 {
  constructor(options: GeminiProVisionOptionsType) {
    super(GeminiProVisionSchema, options);
  }
}

export { GeminiProVision, GeminiProVisionOptions, GeminiProVisionSchema, GeminiProVisionLiteral, type GeminiProVisionOptionsType };
