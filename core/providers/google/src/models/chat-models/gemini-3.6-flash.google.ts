import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash (retrieved 2026-07-29)
const Gemini3_6FlashLiteral = "gemini-3.6-flash";
const Gemini3_6FlashDescription =
  "Google's Gemini 3.6 Flash model for frontier performance on agentic and coding tasks at high speed. \
  A thinking model with improved token efficiency and enhanced code and agentic planning capabilities. \
  Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini3_6FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_6FlashLiteral,
  description: Gemini3_6FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_6FlashLiteral],
});

const Gemini3_6FlashOptions = BaseChatModelOptions;
type Gemini3_6FlashOptionsType = z.infer<typeof Gemini3_6FlashOptions>;

class Gemini3_6Flash extends BaseChatModel {
  constructor(options: Gemini3_6FlashOptionsType) {
    super(Gemini3_6FlashSchema, options);
  }
}

export { Gemini3_6Flash, Gemini3_6FlashLiteral, Gemini3_6FlashOptions, Gemini3_6FlashSchema, type Gemini3_6FlashOptionsType };
