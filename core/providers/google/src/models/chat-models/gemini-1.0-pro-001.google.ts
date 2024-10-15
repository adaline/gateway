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

const Gemini1_0Pro_001Literal = "gemini-1.0-pro-001";
const Gemini1_0Pro_001Description =
  "Google's predecessor to Gemini 1.5 Pro, a model for scaling across a wide range of tasks \
  Optimized for natural language tasks, multi-turn text and code chat, and code generation";

const Gemini1_0Pro_001Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextToolModalitiesEnum).parse({
  name: Gemini1_0Pro_001Literal,
  description: Gemini1_0Pro_001Description,
  maxInputTokens: 30720,
  maxOutputTokens: 2048,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextToolModalities,
  config: {
    def: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).def,
    schema: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).schema,
  },
});

const Gemini1_0Pro_001Options = BaseChatModelOptions;
type Gemini1_0Pro_001OptionsType = z.infer<typeof Gemini1_0Pro_001Options>;

class Gemini1_0Pro_001 extends BaseChatModelGemini1 {
  constructor(options: Gemini1_0Pro_001OptionsType) {
    super(Gemini1_0Pro_001Schema, options);
  }
}

export { Gemini1_0Pro_001, Gemini1_0Pro_001Options, Gemini1_0Pro_001Schema, Gemini1_0Pro_001Literal, type Gemini1_0Pro_001OptionsType };
