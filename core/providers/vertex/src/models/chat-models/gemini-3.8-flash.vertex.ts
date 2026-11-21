import { z } from "zod";

import { Gemini3_8FlashSchema as Google_Gemini3_8FlashSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-11-20)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-8-flash (retrieved 2026-11-20)
// Price (Global Standard PayGo): $1.50/$7.50 per 1M tokens (standard list price from 2027-01-01, stored in pricing.json);
// intro price $0.75/$3.75 until 2026-12-31. Regional (non-global) endpoints are +10%.
// Retirement: "Sept 2, 2027 or later". Replacement for gemini-3.6-flash (retired on Vertex 2026-11-19).
const Gemini3_8FlashLiteral = "gemini-3.8-flash" as const;
const Gemini3_8FlashSchema = {
  ...Google_Gemini3_8FlashSchema,
  price: pricingData[Gemini3_8FlashLiteral],
} as const;
const Gemini3_8FlashOptions = BaseChatModelOptions;
type Gemini3_8FlashOptionsType = z.infer<typeof Gemini3_8FlashOptions>;

class Gemini3_8Flash extends BaseChatModelVertex {
  constructor(options: Gemini3_8FlashOptionsType) {
    super(Gemini3_8FlashSchema, options);
  }
}

export { Gemini3_8Flash, Gemini3_8FlashLiteral, Gemini3_8FlashOptions, Gemini3_8FlashSchema, type Gemini3_8FlashOptionsType };
