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

const Gemini1_0ProLiteral = "gemini-1.0-pro";
const Gemini1_0ProDescription =
  "Google's predecessor to Gemini 1.5 Pro, a model for scaling across a wide range of tasks \
  Optimized for natural language tasks, multi-turn text and code chat, and code generation";

const Gemini1_0ProSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextToolModalitiesEnum).parse({
  name: Gemini1_0ProLiteral,
  description: Gemini1_0ProDescription,
  maxInputTokens: 30720,
  maxOutputTokens: 2048,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextToolModalities,
  config: {
    def: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).def,
    schema: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).schema,
  },
});

const Gemini1_0ProOptions = BaseChatModelOptions;
type Gemini1_0ProOptionsType = z.infer<typeof Gemini1_0ProOptions>;

class Gemini1_0Pro extends BaseChatModelGemini1 {
  constructor(options: Gemini1_0ProOptionsType) {
    super(Gemini1_0ProSchema, options);
  }
}

export { Gemini1_0Pro, Gemini1_0ProOptions, Gemini1_0ProSchema, Gemini1_0ProLiteral, type Gemini1_0ProOptionsType };
