import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_0FlashLiteLiteral = "gemini-2.0-flash-lite";
const Gemini2_0FlashLiteDescription =
  "Google's lightweight Gemini 2.0 Flash Lite model for high-throughput, low-cost text generation and classification workloads.";

const Gemini2_0FlashLiteSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_0FlashLiteLiteral,
  description: Gemini2_0FlashLiteDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 8192,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 8192, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_0FlashLiteLiteral],
});

const Gemini2_0FlashLiteOptions = BaseChatModelOptions;
type Gemini2_0FlashLiteOptionsType = z.infer<typeof Gemini2_0FlashLiteOptions>;

class Gemini2_0FlashLite extends BaseChatModel {
  constructor(options: Gemini2_0FlashLiteOptionsType) {
    super(Gemini2_0FlashLiteSchema, options);
  }
}

export {
  Gemini2_0FlashLite,
  Gemini2_0FlashLiteLiteral,
  Gemini2_0FlashLiteOptions,
  Gemini2_0FlashLiteSchema,
  type Gemini2_0FlashLiteOptionsType,
};

