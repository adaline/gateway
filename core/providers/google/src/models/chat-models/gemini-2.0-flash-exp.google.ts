import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_0FlashExpLiteral = "gemini-2.0-flash-exp";
const Gemini2_0FlashExpDescription =
  "Google's experimental multimodal model with enhanced capabilities. \
  Designed for cutting-edge performance across complex and high-frequency tasks.";

const Gemini2_0FlashExpSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_0FlashExpLiteral,
  description: Gemini2_0FlashExpDescription,
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
  price: pricingData[Gemini2_0FlashExpLiteral],
});

const Gemini2_0FlashExpOptions = BaseChatModelOptions;
type Gemini2_0FlashExpOptionsType = z.infer<typeof Gemini2_0FlashExpOptions>;

class Gemini2_0FlashExp extends BaseChatModel {
  constructor(options: Gemini2_0FlashExpOptionsType) {
    super(Gemini2_0FlashExpSchema, options);
  }
}

export {
  Gemini2_0FlashExp,
  Gemini2_0FlashExpLiteral,
  Gemini2_0FlashExpOptions,
  Gemini2_0FlashExpSchema,
  type Gemini2_0FlashExpOptionsType,
};
