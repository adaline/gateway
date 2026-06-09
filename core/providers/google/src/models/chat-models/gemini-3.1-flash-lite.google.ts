import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite (retrieved 2026-06-09)
const Gemini3_1FlashLiteLiteral = "gemini-3.1-flash-lite";
const Gemini3_1FlashLiteDescription =
  "Google's most cost-efficient and fastest model in the Gemini 3.1 series. \
  A thinking model optimized for high-volume, latency-sensitive tasks like classification and translation. \
  Supports Text, Image, Video, Audio, and PDF inputs. Knowledge cutoff: January 2025.";

const Gemini3_1FlashLiteSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_1FlashLiteLiteral,
  description: Gemini3_1FlashLiteDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_1FlashLiteLiteral],
});

const Gemini3_1FlashLiteOptions = BaseChatModelOptions;
type Gemini3_1FlashLiteOptionsType = z.infer<typeof Gemini3_1FlashLiteOptions>;

class Gemini3_1FlashLite extends BaseChatModel {
  constructor(options: Gemini3_1FlashLiteOptionsType) {
    super(Gemini3_1FlashLiteSchema, options);
  }
}

export {
  Gemini3_1FlashLite,
  Gemini3_1FlashLiteLiteral,
  Gemini3_1FlashLiteOptions,
  Gemini3_1FlashLiteSchema,
  type Gemini3_1FlashLiteOptionsType,
};
