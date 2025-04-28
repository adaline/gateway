import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "./../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5ProPreview0325Literal = "gemini-2.5-pro-preview-03-25";
const Gemini2_5ProPreview0325Description =
  "Google's preview model for enhanced thinking, reasoning, multimodal understanding, and advanced coding.";

// Assuming standard token limits, adjust if specific limits are known
const Gemini2_5ProPreview0325Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5ProPreview0325Literal,
  description: Gemini2_5ProPreview0325Description,
  maxInputTokens: 1000000, // Common for Pro models
  maxOutputTokens: 8192, // Standard output limit, might be higher for Pro
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities, // Supports text, image, audio, video input
  config: {
    // Using default config structure, adjust parameters if needed
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
  price: pricingData[Gemini2_5ProPreview0325Literal],
});

const Gemini2_5ProPreview0325Options = BaseChatModelOptions;
type Gemini2_5ProPreview0325OptionsType = z.infer<typeof Gemini2_5ProPreview0325Options>;

class Gemini2_5ProPreview0325 extends BaseChatModel {
  constructor(options: Gemini2_5ProPreview0325OptionsType) {
    super(Gemini2_5ProPreview0325Schema, options);
  }
}

export {
  Gemini2_5ProPreview0325,
  Gemini2_5ProPreview0325Literal,
  Gemini2_5ProPreview0325Options,
  Gemini2_5ProPreview0325Schema,
  type Gemini2_5ProPreview0325OptionsType,
};
