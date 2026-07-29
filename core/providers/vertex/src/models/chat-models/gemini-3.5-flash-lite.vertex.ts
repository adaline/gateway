import { z } from "zod";

import { Gemini3_5FlashLiteSchema as Google_Gemini3_5FlashLiteSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-07-29)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite (retrieved 2026-07-29)
const Gemini3_5FlashLiteLiteral = "gemini-3.5-flash-lite" as const;
const Gemini3_5FlashLiteSchema = {
  ...Google_Gemini3_5FlashLiteSchema,
  price: pricingData[Gemini3_5FlashLiteLiteral],
} as const;
const Gemini3_5FlashLiteOptions = BaseChatModelOptions;
type Gemini3_5FlashLiteOptionsType = z.infer<typeof Gemini3_5FlashLiteOptions>;

class Gemini3_5FlashLite extends BaseChatModelVertex {
  constructor(options: Gemini3_5FlashLiteOptionsType) {
    super(Gemini3_5FlashLiteSchema, options);
  }
}

export {
  Gemini3_5FlashLite,
  Gemini3_5FlashLiteLiteral,
  Gemini3_5FlashLiteOptions,
  Gemini3_5FlashLiteSchema,
  type Gemini3_5FlashLiteOptionsType,
};
