import { z } from "zod";

import { Gemini1_5ProLatestSchema as Google_Gemini1_5ProLatestSchema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini1_5ProLatestLiteral = "gemini-1.5-pro-latest" as const;
const Gemini1_5ProLatestSchema = {
  ...Google_Gemini1_5ProLatestSchema,
  price: pricingData[Gemini1_5ProLatestLiteral],
} as const;
const Gemini1_5ProLatestOptions = BaseChatModelOptions;
type Gemini1_5ProLatestOptionsType = z.infer<typeof Gemini1_5ProLatestOptions>;

class Gemini1_5ProLatest extends BaseChatModelVertex {
  constructor(options: Gemini1_5ProLatestOptionsType) {
    super(Gemini1_5ProLatestSchema, options);
  }
}

export {
  Gemini1_5ProLatest,
  Gemini1_5ProLatestLiteral,
  Gemini1_5ProLatestOptions,
  Gemini1_5ProLatestSchema,
  type Gemini1_5ProLatestOptionsType,
};
