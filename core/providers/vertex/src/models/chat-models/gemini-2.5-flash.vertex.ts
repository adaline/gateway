import { z } from "zod";

import { Gemini2_5FlashSchema as Google_Gemini2_5FlashSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5FlashLiteral = "gemini-2.5-flash" as const;
const Gemini2_5FlashSchema = {
  ...Google_Gemini2_5FlashSchema,
  price: pricingData[Gemini2_5FlashLiteral],
} as const;
const Gemini2_5FlashOptions = BaseChatModelOptions;
type Gemini2_5FlashOptionsType = z.infer<typeof Gemini2_5FlashOptions>;

class Gemini2_5Flash extends BaseChatModelVertex {
  constructor(options: Gemini2_5FlashOptionsType) {
    super(Gemini2_5FlashSchema, options);
  }
}

export { Gemini2_5Flash, Gemini2_5FlashLiteral, Gemini2_5FlashOptions, Gemini2_5FlashSchema, type Gemini2_5FlashOptionsType };
