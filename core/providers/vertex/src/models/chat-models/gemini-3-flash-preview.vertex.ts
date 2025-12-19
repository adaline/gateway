import { z } from "zod";

import { Gemini3FlashPreviewSchema as Google_Gemini3FlashPreviewSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini3FlashPreviewLiteral = "gemini-3-flash-preview" as const;
const Gemini3FlashPreviewSchema = {
  ...Google_Gemini3FlashPreviewSchema,
  price: pricingData[Gemini3FlashPreviewLiteral],
} as const;
const Gemini3FlashPreviewOptions = BaseChatModelOptions;
type Gemini3FlashPreviewOptionsType = z.infer<typeof Gemini3FlashPreviewOptions>;

class Gemini3FlashPreview extends BaseChatModelVertex {
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

