import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/models/gemini (retrieved 2025-11-18)
const Gemini3ProPreviewLiteral = "gemini-3-pro-preview";
const Gemini3ProPreviewDescription =
  "Google's latest Gemini 3 Pro Preview model with enhanced multimodal understanding, reasoning, and thinking capabilities. \
  Supports Text, Image, Video, Audio, and PDF inputs. Knowledge cutoff: January 2025.";

const Gemini3ProPreviewSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3ProPreviewLiteral,
  description: Gemini3ProPreviewDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3ProPreviewLiteral],
});

const Gemini3ProPreviewOptions = BaseChatModelOptions;
type Gemini3ProPreviewOptionsType = z.infer<typeof Gemini3ProPreviewOptions>;

class Gemini3ProPreview extends BaseChatModel {
  constructor(options: Gemini3ProPreviewOptionsType) {
    super(Gemini3ProPreviewSchema, options);
  }
}

export {
  Gemini3ProPreview,
  Gemini3ProPreviewLiteral,
  Gemini3ProPreviewOptions,
  Gemini3ProPreviewSchema,
  type Gemini3ProPreviewOptionsType,
};



