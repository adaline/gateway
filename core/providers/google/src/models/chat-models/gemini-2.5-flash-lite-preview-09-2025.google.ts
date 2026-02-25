import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5FlashLitePreview092025Literal = "gemini-2.5-flash-lite-preview-09-2025";
const Gemini2_5FlashLitePreview092025Description =
  "Google's preview Flash Lite variant in the Gemini 2.5 family, optimized for low-latency, high-volume tasks.";

const Gemini2_5FlashLitePreview092025Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5FlashLitePreview092025Literal,
  description: Gemini2_5FlashLitePreview092025Description,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_5FlashLitePreview092025Literal],
});

const Gemini2_5FlashLitePreview092025Options = BaseChatModelOptions;
type Gemini2_5FlashLitePreview092025OptionsType = z.infer<typeof Gemini2_5FlashLitePreview092025Options>;

class Gemini2_5FlashLitePreview092025 extends BaseChatModel {
  constructor(options: Gemini2_5FlashLitePreview092025OptionsType) {
    super(Gemini2_5FlashLitePreview092025Schema, options);
  }
}

export {
  Gemini2_5FlashLitePreview092025,
  Gemini2_5FlashLitePreview092025Literal,
  Gemini2_5FlashLitePreview092025Options,
  Gemini2_5FlashLitePreview092025Schema,
  type Gemini2_5FlashLitePreview092025OptionsType,
};

