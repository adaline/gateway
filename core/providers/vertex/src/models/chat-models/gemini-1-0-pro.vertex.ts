import { z } from "zod";

import { Gemini1_0ProSchema as Google_Gemini1_0ProSchema } from "@adaline/google";

import pricingData from "./../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini1_0ProLiteral = "gemini-1.0-pro" as const;

// Override the schema
const Gemini1_0ProSchema = {
  ...Google_Gemini1_0ProSchema,
  price: pricingData[Gemini1_0ProLiteral],
} as const;

const Gemini1_0ProOptions = BaseChatModelOptions;
type Gemini1_0ProOptionsType = z.infer<typeof Gemini1_0ProOptions>;

class Gemini1_0Pro extends BaseChatModelVertex {
  constructor(options: Gemini1_0ProOptionsType) {
    super(Gemini1_0ProSchema, options);
  }
}

export { Gemini1_0Pro, Gemini1_0ProLiteral, Gemini1_0ProOptions, Gemini1_0ProSchema, type Gemini1_0ProOptionsType };
