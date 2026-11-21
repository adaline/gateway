import { z } from "zod";

import { Gemini4HydrogenSchema as Google_Gemini4HydrogenSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-11-20)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-hydrogen (retrieved 2026-11-20)
// Price (Global Standard PayGo): $1.50/$7.50 per 1M tokens. Regional (non-global) endpoints are +10% ($1.65/$8.25).
// Cached input $0.075 per 1M (not representable in pricing.json). Short-term GA.
const Gemini4HydrogenLiteral = "gemini-4-hydrogen" as const;
const Gemini4HydrogenSchema = {
  ...Google_Gemini4HydrogenSchema,
  price: pricingData[Gemini4HydrogenLiteral],
} as const;
const Gemini4HydrogenOptions = BaseChatModelOptions;
type Gemini4HydrogenOptionsType = z.infer<typeof Gemini4HydrogenOptions>;

class Gemini4Hydrogen extends BaseChatModelVertex {
  constructor(options: Gemini4HydrogenOptionsType) {
    super(Gemini4HydrogenSchema, options);
  }
}

export { Gemini4Hydrogen, Gemini4HydrogenLiteral, Gemini4HydrogenOptions, Gemini4HydrogenSchema, type Gemini4HydrogenOptionsType };
