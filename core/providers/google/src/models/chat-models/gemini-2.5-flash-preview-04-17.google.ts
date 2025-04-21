import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5FlashPreview0417Literal = "gemini-2.5-flash-preview-04-17";
const Gemini2_5FlashPreview0417Description = "Google's fast and cost-efficient multimodal model for adaptive thinking.";

// Assuming standard token limits, adjust if specific limits are known
const Gemini2_5FlashPreview0417Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5FlashPreview0417Literal,
  description: Gemini2_5FlashPreview0417Description,
  maxInputTokens: 1000000, // Common for Flash models
  maxOutputTokens: 8192, // Standard output limit
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities, // Supports text, image, audio, video input
  config: {
    // Using default config structure, adjust parameters if needed
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 8192, 4, 0.95, 64).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 8192, 4, 0.95, 64).schema,
  },
});

const Gemini2_5FlashPreview0417Options = BaseChatModelOptions;
type Gemini2_5FlashPreview0417OptionsType = z.infer<typeof Gemini2_5FlashPreview0417Options>;

class Gemini2_5FlashPreview0417 extends BaseChatModel {
  constructor(options: Gemini2_5FlashPreview0417OptionsType) {
    super(Gemini2_5FlashPreview0417Schema, options);
  }
}

export {
  Gemini2_5FlashPreview0417,
  Gemini2_5FlashPreview0417Literal,
  Gemini2_5FlashPreview0417Options,
  Gemini2_5FlashPreview0417Schema,
  type Gemini2_5FlashPreview0417OptionsType,
};
