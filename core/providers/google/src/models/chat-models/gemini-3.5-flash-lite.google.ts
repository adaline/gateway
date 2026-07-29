import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite (retrieved 2026-07-29)
const Gemini3_5FlashLiteLiteral = "gemini-3.5-flash-lite";
const Gemini3_5FlashLiteDescription =
  "Google's most cost-efficient and fastest model in the Gemini 3.5 series. \
  A thinking model optimized as a low-latency, cost-effective subagent for high-volume tasks like classification and translation. \
  Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini3_5FlashLiteSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_5FlashLiteLiteral,
  description: Gemini3_5FlashLiteDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_5FlashLiteLiteral],
});

const Gemini3_5FlashLiteOptions = BaseChatModelOptions;
type Gemini3_5FlashLiteOptionsType = z.infer<typeof Gemini3_5FlashLiteOptions>;

class Gemini3_5FlashLite extends BaseChatModel {
  constructor(options: Gemini3_5FlashLiteOptionsType) {
    super(Gemini3_5FlashLiteSchema, options);
  }
}

export {
  Gemini3_5FlashLite,
  Gemini3_5FlashLiteLiteral,
  Gemini3_5FlashLiteOptions,
  Gemini3_5FlashLiteSchema,
  type Gemini3_5FlashLiteOptionsType,
};
