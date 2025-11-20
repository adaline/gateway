import { z } from "zod";

import { Gemini2_5ProSchema as Google_Gemini2_5ProSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5ProLiteral = "gemini-2.5-pro" as const;
const Gemini2_5ProSchema = {
  ...Google_Gemini2_5ProSchema,
  price: pricingData[Gemini2_5ProLiteral],
} as const;
const Gemini2_5ProOptions = BaseChatModelOptions;
type Gemini2_5ProOptionsType = z.infer<typeof Gemini2_5ProOptions>;

class Gemini2_5Pro extends BaseChatModelVertex {
  constructor(options: Gemini2_5ProOptionsType) {
    super(Gemini2_5ProSchema, options);
  }
}

export { Gemini2_5Pro, Gemini2_5ProLiteral, Gemini2_5ProOptions, Gemini2_5ProSchema, type Gemini2_5ProOptionsType };
