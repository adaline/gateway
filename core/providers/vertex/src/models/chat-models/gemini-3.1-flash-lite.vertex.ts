import { z } from "zod";

import { Gemini3_1FlashLiteSchema as Google_Gemini3_1FlashLiteSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing (retrieved 2026-07-10)
// Specs reference: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-1-flash-lite (retrieved 2026-07-10)
const Gemini3_1FlashLiteLiteral = "gemini-3.1-flash-lite" as const;
const Gemini3_1FlashLiteSchema = {
  ...Google_Gemini3_1FlashLiteSchema,
  price: pricingData[Gemini3_1FlashLiteLiteral],
} as const;
const Gemini3_1FlashLiteOptions = BaseChatModelOptions;
type Gemini3_1FlashLiteOptionsType = z.infer<typeof Gemini3_1FlashLiteOptions>;

class Gemini3_1FlashLite extends BaseChatModelVertex {
  constructor(options: Gemini3_1FlashLiteOptionsType) {
    super(Gemini3_1FlashLiteSchema, options);
  }
}

export {
  Gemini3_1FlashLite,
  Gemini3_1FlashLiteLiteral,
  Gemini3_1FlashLiteOptions,
  Gemini3_1FlashLiteSchema,
  type Gemini3_1FlashLiteOptionsType,
};
