import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5FlashLiteLiteral = "gemini-2.5-flash-lite";
const Gemini2_5FlashLiteDescription =
  "Google's most cost-efficient and fastest model in the 2.5 series. \
  Optimized for high-volume, latency-sensitive tasks like translation and classification with enhanced reasoning capabilities.";

const Gemini2_5FlashLiteSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5FlashLiteLiteral,
  description: Gemini2_5FlashLiteDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_5FlashLiteLiteral],
});

const Gemini2_5FlashLiteOptions = BaseChatModelOptions;
type Gemini2_5FlashLiteOptionsType = z.infer<typeof Gemini2_5FlashLiteOptions>;

class Gemini2_5FlashLite extends BaseChatModel {
  constructor(options: Gemini2_5FlashLiteOptionsType) {
    super(Gemini2_5FlashLiteSchema, options);
  }
}

export {
    Gemini2_5FlashLite,
    Gemini2_5FlashLiteLiteral,
    Gemini2_5FlashLiteOptions,
    Gemini2_5FlashLiteSchema,
    type Gemini2_5FlashLiteOptionsType
};

