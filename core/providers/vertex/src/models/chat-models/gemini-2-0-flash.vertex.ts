import { z } from "zod";

import { Gemini2_0FlashSchema as Google_Gemini2_0FlashSchema } from "@adaline/google";
import { ChatModelSchemaType } from "@adaline/provider";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_0FlashLiteral = "gemini-2.0-flash" as const;

// Override the schema
const Gemini2_0FlashSchema: ChatModelSchemaType = {
  ...Google_Gemini2_0FlashSchema,
  price: pricingData[Gemini2_0FlashLiteral],
};

const Gemini2_0FlashOptions = BaseChatModelOptions;
type Gemini2_0FlashOptionsType = z.infer<typeof Gemini2_0FlashOptions>;

class Gemini2_0Flash extends BaseChatModelVertex {
  constructor(options: Gemini2_0FlashOptionsType) {
    super(Gemini2_0FlashSchema, options);
  }
}

export { Gemini2_0Flash, Gemini2_0FlashLiteral, Gemini2_0FlashOptions, Gemini2_0FlashSchema, type Gemini2_0FlashOptionsType };
