import { z } from "zod";

import { Gemini1_5FlashLatestSchema as Google_Gemini1_5FlashLatestSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini1_5FlashLatestLiteral = "gemini-1.5-flash-latest" as const;
const Gemini1_5FlashLatestSchema = {
  ...Google_Gemini1_5FlashLatestSchema,
  price: pricingData[Gemini1_5FlashLatestLiteral],
} as const;
const Gemini1_5FlashLatestOptions = BaseChatModelOptions;
type Gemini1_5FlashLatestOptionsType = z.infer<typeof Gemini1_5FlashLatestOptions>;

class Gemini1_5FlashLatest extends BaseChatModelVertex {
  constructor(options: Gemini1_5FlashLatestOptionsType) {
    super(Gemini1_5FlashLatestSchema, options);
  }
}

export {
  Gemini1_5FlashLatest,
  Gemini1_5FlashLatestLiteral,
  Gemini1_5FlashLatestOptions,
  Gemini1_5FlashLatestSchema,
  type Gemini1_5FlashLatestOptionsType,
};
