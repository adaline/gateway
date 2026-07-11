import { z } from "zod";

import { Gemini3_5FlashSchema as Google_Gemini3_5FlashSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-07-10)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash (retrieved 2026-07-10)
const Gemini3_5FlashLiteral = "gemini-3.5-flash" as const;
const Gemini3_5FlashSchema = {
  ...Google_Gemini3_5FlashSchema,
  price: pricingData[Gemini3_5FlashLiteral],
} as const;
const Gemini3_5FlashOptions = BaseChatModelOptions;
type Gemini3_5FlashOptionsType = z.infer<typeof Gemini3_5FlashOptions>;

class Gemini3_5Flash extends BaseChatModelVertex {
  constructor(options: Gemini3_5FlashOptionsType) {
    super(Gemini3_5FlashSchema, options);
  }
}

export { Gemini3_5Flash, Gemini3_5FlashLiteral, Gemini3_5FlashOptions, Gemini3_5FlashSchema, type Gemini3_5FlashOptionsType };
