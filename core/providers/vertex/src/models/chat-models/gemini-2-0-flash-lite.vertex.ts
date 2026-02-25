import { z } from "zod";

import { Gemini2_0FlashLiteSchema as Google_Gemini2_0FlashLiteSchema } from "@adaline/google";
import { ChatModelSchemaType } from "@adaline/provider";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_0FlashLiteLiteral = "gemini-2.0-flash-lite" as const;

const Gemini2_0FlashLiteSchema: ChatModelSchemaType = {
  ...Google_Gemini2_0FlashLiteSchema,
  price: pricingData[Gemini2_0FlashLiteLiteral],
};

const Gemini2_0FlashLiteOptions = BaseChatModelOptions;
type Gemini2_0FlashLiteOptionsType = z.infer<typeof Gemini2_0FlashLiteOptions>;

class Gemini2_0FlashLite extends BaseChatModelVertex {
  constructor(options: Gemini2_0FlashLiteOptionsType) {
    super(Gemini2_0FlashLiteSchema, options);
  }
}

export {
  Gemini2_0FlashLite,
  Gemini2_0FlashLiteLiteral,
  Gemini2_0FlashLiteOptions,
  Gemini2_0FlashLiteSchema,
  type Gemini2_0FlashLiteOptionsType,
};

