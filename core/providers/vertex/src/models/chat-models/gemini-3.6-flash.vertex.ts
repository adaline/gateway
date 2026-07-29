import { z } from "zod";

import { Gemini3_6FlashSchema as Google_Gemini3_6FlashSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-07-29)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-6-flash (retrieved 2026-07-29)
const Gemini3_6FlashLiteral = "gemini-3.6-flash" as const;
const Gemini3_6FlashSchema = {
  ...Google_Gemini3_6FlashSchema,
  price: pricingData[Gemini3_6FlashLiteral],
} as const;
const Gemini3_6FlashOptions = BaseChatModelOptions;
type Gemini3_6FlashOptionsType = z.infer<typeof Gemini3_6FlashOptions>;

class Gemini3_6Flash extends BaseChatModelVertex {
  constructor(options: Gemini3_6FlashOptionsType) {
    super(Gemini3_6FlashSchema, options);
  }
}

export { Gemini3_6Flash, Gemini3_6FlashLiteral, Gemini3_6FlashOptions, Gemini3_6FlashSchema, type Gemini3_6FlashOptionsType };
