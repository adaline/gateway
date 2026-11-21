import { z } from "zod";

import { Gemini4NeonSchema as Google_Gemini4NeonSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-11-20)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon (retrieved 2026-11-20)
// Price (Global Standard PayGo): $3/$15 per 1M tokens. Regional (non-global) endpoints are +10% ($3.30/$16.50).
// Cached input $0.15 per 1M (not representable in pricing.json). Access: verified enterprise customers only.
const Gemini4NeonLiteral = "gemini-4-neon" as const;
const Gemini4NeonSchema = {
  ...Google_Gemini4NeonSchema,
  price: pricingData[Gemini4NeonLiteral],
} as const;
const Gemini4NeonOptions = BaseChatModelOptions;
type Gemini4NeonOptionsType = z.infer<typeof Gemini4NeonOptions>;

class Gemini4Neon extends BaseChatModelVertex {
  constructor(options: Gemini4NeonOptionsType) {
    super(Gemini4NeonSchema, options);
  }
}

export { Gemini4Neon, Gemini4NeonLiteral, Gemini4NeonOptions, Gemini4NeonSchema, type Gemini4NeonOptionsType };
