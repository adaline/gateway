import { z } from "zod";

import { Gemini4ArgonSchema as Google_Gemini4ArgonSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-11-20)
// Specs reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-argon (retrieved 2026-11-20)
// Price (Global Standard PayGo): $4/$20 per 1M tokens (standard list price, stored in pricing.json); promo $2/$10 until 2026-11-30.
// Regional (non-global) endpoints are +10% ($4.40/$22). Cached input $0.20 per 1M (not representable in pricing.json).
// Retirement: "Oct 13, 2027 or later".
// Vertex caps non-streaming output at 32,768 tokens (65,536 when streaming); maxOutputTokens stays 65,536 to match the model.
const Gemini4ArgonLiteral = "gemini-4-argon" as const;
const Gemini4ArgonSchema = {
  ...Google_Gemini4ArgonSchema,
  price: pricingData[Gemini4ArgonLiteral],
} as const;
const Gemini4ArgonOptions = BaseChatModelOptions;
type Gemini4ArgonOptionsType = z.infer<typeof Gemini4ArgonOptions>;

class Gemini4Argon extends BaseChatModelVertex {
  constructor(options: Gemini4ArgonOptionsType) {
    super(Gemini4ArgonSchema, options);
  }
}

export { Gemini4Argon, Gemini4ArgonLiteral, Gemini4ArgonOptions, Gemini4ArgonSchema, type Gemini4ArgonOptionsType };
