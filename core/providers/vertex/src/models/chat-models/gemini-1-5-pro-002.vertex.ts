import { z } from "zod";

import { Gemini1_5Pro002Schema as Google_Gemini1_5Pro002Schema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini1_5Pro002Literal = "gemini-1.5-pro-002" as const;

const Gemini1_5Pro002Schema = {
  ...Google_Gemini1_5Pro002Schema,
  price: pricingData[Gemini1_5Pro002Literal],
} as const;
const Gemini1_5Pro002Options = BaseChatModelOptions;
type Gemini1_5Pro002OptionsType = z.infer<typeof Gemini1_5Pro002Options>;

class Gemini1_5Pro002 extends BaseChatModelVertex {
  constructor(options: Gemini1_5Pro002OptionsType) {
    super(Gemini1_5Pro002Schema, options);
  }
}

export { Gemini1_5Pro002, Gemini1_5Pro002Literal, Gemini1_5Pro002Options, Gemini1_5Pro002Schema, type Gemini1_5Pro002OptionsType };
