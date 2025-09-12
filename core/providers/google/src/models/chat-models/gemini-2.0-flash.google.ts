import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_0FlashLiteral = "gemini-2.0-flash";
const Gemini2_0FlashDescription =
  "Google's Gemini 2.0 Flash model optimized for low-latency, high-performance tasks. \
  Supports multimodal inputs including text, images, video, and audio with enhanced speed and efficiency.";

const Gemini2_0FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_0FlashLiteral,
  description: Gemini2_0FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_0FlashLiteral],
});

const Gemini2_0FlashOptions = BaseChatModelOptions;
type Gemini2_0FlashOptionsType = z.infer<typeof Gemini2_0FlashOptions>;

class Gemini2_0Flash extends BaseChatModel {
  constructor(options: Gemini2_0FlashOptionsType) {
    super(Gemini2_0FlashSchema, options);
  }
}

export {
    Gemini2_0Flash,
    Gemini2_0FlashLiteral,
    Gemini2_0FlashOptions,
    Gemini2_0FlashSchema,
    type Gemini2_0FlashOptionsType
};

