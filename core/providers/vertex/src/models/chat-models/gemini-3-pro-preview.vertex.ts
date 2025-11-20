import { z } from "zod";

import { Gemini3ProPreviewSchema as Google_Gemini3ProPreviewSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini3ProPreviewLiteral = "gemini-3-pro-preview" as const;
const Gemini3ProPreviewSchema = {
  ...Google_Gemini3ProPreviewSchema,
  price: pricingData[Gemini3ProPreviewLiteral],
} as const;
const Gemini3ProPreviewOptions = BaseChatModelOptions;
type Gemini3ProPreviewOptionsType = z.infer<typeof Gemini3ProPreviewOptions>;

class Gemini3ProPreview extends BaseChatModelVertex {
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
