import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelOptions } from "./base-chat-model.google";
import { BaseChatModelGemini1 } from "./base-gemini-1-chat-model.google";
import {
  GoogleChatModelRoles,
  GoogleChatModelRolesMap,
  GoogleChatModelTextImageModalities,
  GoogleChatModelTextImageModalitiesEnum,
} from "./types";

const Gemini1_0ProVision_001Literal = "gemini-1.0-pro-vision-001";
const Gemini1_0ProVision_001Description =
  "Google's predecessor to Gemini 1.5 Pro, a model for scaling across a wide range of tasks \
  Optimized for natural language tasks, multi-turn text and code chat, and code generation";

const Gemini1_0ProVision_001Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelTextImageModalitiesEnum).parse({
  name: Gemini1_0ProVision_001Literal,
  description: Gemini1_0ProVision_001Description,
  maxInputTokens: 30720,
  maxOutputTokens: 2048,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelTextImageModalities,
  config: {
    def: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).def,
    schema: GoogleChatModelConfigs.base(1.0, 0.9, 2048, 4, 1.0).schema,
  },
  price: pricingData[Gemini1_0ProVision_001Literal],
});

const Gemini1_0ProVision_001Options = BaseChatModelOptions;
type Gemini1_0ProVision_001OptionsType = z.infer<typeof Gemini1_0ProVision_001Options>;

class Gemini1_0ProVision_001 extends BaseChatModelGemini1 {
  constructor(options: Gemini1_0ProVision_001OptionsType) {
    super(Gemini1_0ProVision_001Schema, options);
  }
}

export {
  Gemini1_0ProVision_001,
  Gemini1_0ProVision_001Literal,
  Gemini1_0ProVision_001Options,
  Gemini1_0ProVision_001Schema,
  type Gemini1_0ProVision_001OptionsType,
};
