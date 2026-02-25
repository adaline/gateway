import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview (retrieved 2026-02-25)
const Gemini3_1ProPreviewCustomtoolsLiteral = "gemini-3.1-pro-preview-customtools";
const Gemini3_1ProPreviewCustomtoolsDescription =
  "Google's Gemini 3.1 Pro Preview variant optimized for the custom tools endpoint in the Gemini API.";

const Gemini3_1ProPreviewCustomtoolsSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_1ProPreviewCustomtoolsLiteral,
  description: Gemini3_1ProPreviewCustomtoolsDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_1ProPreviewCustomtoolsLiteral],
});

const Gemini3_1ProPreviewCustomtoolsOptions = BaseChatModelOptions;
type Gemini3_1ProPreviewCustomtoolsOptionsType = z.infer<typeof Gemini3_1ProPreviewCustomtoolsOptions>;

class Gemini3_1ProPreviewCustomtools extends BaseChatModel {
  constructor(options: Gemini3_1ProPreviewCustomtoolsOptionsType) {
    super(Gemini3_1ProPreviewCustomtoolsSchema, options);
  }
}

export {
  Gemini3_1ProPreviewCustomtools,
  Gemini3_1ProPreviewCustomtoolsLiteral,
  Gemini3_1ProPreviewCustomtoolsOptions,
  Gemini3_1ProPreviewCustomtoolsSchema,
  type Gemini3_1ProPreviewCustomtoolsOptionsType,
};

