import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-3.6-flash (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// Pricing: pricing.json holds the standard $1.50/$7.50 rate (applies from 2027-01-01); intro price $0.75/$3.75 until 2026-12-31.
// Thinking: thinking_level LOW/MEDIUM/HIGH (default MEDIUM); temperature/topP/topK deprecated on Gemini 3.6+ and omitted.
const Gemini3_6FlashLiteral = "gemini-3.6-flash";
const Gemini3_6FlashDescription =
  "Google's Gemini 3.6 Flash model for frontier performance on agentic and coding tasks at high speed. \
  A thinking model with improved token efficiency and enhanced code and agentic planning capabilities. \
  Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini3_6FlashThinkingLevels = ["LOW", "MEDIUM", "HIGH"] as const;

const Gemini3_6FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_6FlashLiteral,
  description: Gemini3_6FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini3_6FlashThinkingLevels, "MEDIUM").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini3_6FlashThinkingLevels, "MEDIUM").schema,
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
