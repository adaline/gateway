import { z } from "zod";

import { Gemini4CarbonSchema as Google_Gemini4CarbonSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-11-20)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-carbon (retrieved 2026-11-20)
// Price (Global Standard PayGo): $4/$20 per 1M tokens (standard list price, stored in pricing.json); promo $2/$10 until 2026-11-30.
// Regional (non-global) endpoints are +10% ($4.40/$22). Cached input $0.20 per 1M (not representable in pricing.json).
// Vertex caps non-streaming output at 32,768 tokens (65,536 when streaming); maxOutputTokens stays 65,536 to match the model.
// Access: restricted to "verified enterprise customers in select regions".
const Gemini4CarbonLiteral = "gemini-4-carbon" as const;
const Gemini4CarbonSchema = {
  ...Google_Gemini4CarbonSchema,
  price: pricingData[Gemini4CarbonLiteral],
} as const;
const Gemini4CarbonOptions = BaseChatModelOptions;
type Gemini4CarbonOptionsType = z.infer<typeof Gemini4CarbonOptions>;

class Gemini4Carbon extends BaseChatModelVertex {
  constructor(options: Gemini4CarbonOptionsType) {
    super(Gemini4CarbonSchema, options);
  }
}

export { Gemini4Carbon, Gemini4CarbonLiteral, Gemini4CarbonOptions, Gemini4CarbonSchema, type Gemini4CarbonOptionsType };
