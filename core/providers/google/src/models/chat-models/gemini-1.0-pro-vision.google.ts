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

const Gemini1_0ProVisionLiteral = "gemini-1.0-pro-vision";
const Gemini1_0ProVisionDescription =
  "Google's predecessor to Gemini 1.5 Pro, an image understanding model to handle a broad range of applications";

const Gemini1_0ProVisionSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextVisionModalitiesEnum).parse({
  name: Gemini1_0ProVisionLiteral,
  description: Gemini1_0ProVisionDescription,
  maxInputTokens: 12288,
  maxOutputTokens: 4096,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextVisionModalities,
  config: {
    def: GoogleChatModelConfigs.c1(1.0, 0.4, 4096, 4, 1.0, 32).def,
    schema: GoogleChatModelConfigs.c1(1.0, 0.4, 4096, 4, 1.0, 32).schema,
  },
});

const Gemini1_0ProVisionOptions = BaseChatModelOptions;
type Gemini1_0ProVisionOptionsType = z.infer<typeof Gemini1_0ProVisionOptions>;

class Gemini1_0ProVision extends BaseChatModelGemini1 {
  constructor(options: Gemini1_0ProVisionOptionsType) {
    super(Gemini1_0ProVisionSchema, options);
  }
}

export {
  Gemini1_0ProVision,
  Gemini1_0ProVisionOptions,
  Gemini1_0ProVisionSchema,
  Gemini1_0ProVisionLiteral,
  type Gemini1_0ProVisionOptionsType,
};
