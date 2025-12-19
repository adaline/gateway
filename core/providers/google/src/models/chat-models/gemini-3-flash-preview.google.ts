import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/models/gemini (retrieved 2025-12-19)
const Gemini3FlashPreviewLiteral = "gemini-3-flash-preview";
const Gemini3FlashPreviewDescription =
  "Google's Gemini 3 Flash Preview model - a lightweight and efficient AI model with enhanced multimodal understanding, \
  reasoning, and advanced coding capabilities. Optimized for speed and cost-effectiveness. \
  Supports Text, Image, Video, Audio, and PDF inputs. Knowledge cutoff: January 2025.";

const Gemini3FlashPreviewSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3FlashPreviewLiteral,
  description: Gemini3FlashPreviewDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95).schema,
  },
  price: pricingData[Gemini3FlashPreviewLiteral],
});

const Gemini3FlashPreviewOptions = BaseChatModelOptions;
type Gemini3FlashPreviewOptionsType = z.infer<typeof Gemini3FlashPreviewOptions>;

class Gemini3FlashPreview extends BaseChatModel {
  constructor(options: Gemini3FlashPreviewOptionsType) {
    super(Gemini3FlashPreviewSchema, options);
  }
}

export {
  Gemini3FlashPreview,
  Gemini3FlashPreviewLiteral,
  Gemini3FlashPreviewOptions,
  Gemini3FlashPreviewSchema,
  type Gemini3FlashPreviewOptionsType,
};

