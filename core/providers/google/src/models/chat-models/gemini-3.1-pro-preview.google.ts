import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview (retrieved 2026-02-25)
const Gemini3_1ProPreviewLiteral = "gemini-3.1-pro-preview";
const Gemini3_1ProPreviewDescription =
  "Google's Gemini 3.1 Pro Preview model for improved reliability and nuanced understanding in complex reasoning and multimodal tasks.";

const Gemini3_1ProPreviewSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_1ProPreviewLiteral,
  description: Gemini3_1ProPreviewDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_1ProPreviewLiteral],
});

const Gemini3_1ProPreviewOptions = BaseChatModelOptions;
type Gemini3_1ProPreviewOptionsType = z.infer<typeof Gemini3_1ProPreviewOptions>;

class Gemini3_1ProPreview extends BaseChatModel {
  constructor(options: Gemini3_1ProPreviewOptionsType) {
    super(Gemini3_1ProPreviewSchema, options);
  }
}

export {
  Gemini3_1ProPreview,
  Gemini3_1ProPreviewLiteral,
  Gemini3_1ProPreviewOptions,
  Gemini3_1ProPreviewSchema,
  type Gemini3_1ProPreviewOptionsType,
};

