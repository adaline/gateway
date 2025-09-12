import { z } from "zod";

import { Gemini2_5FlashLiteSchema as Google_Gemini2_5FlashLiteSchema } from "@adaline/google";
import { ChatModelSchemaType } from "@adaline/provider";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5FlashLiteLiteral = "gemini-2.5-flash-lite" as const;

// Override the schema
const Gemini2_5FlashLiteSchema: ChatModelSchemaType = {
  ...Google_Gemini2_5FlashLiteSchema,
  price: pricingData[Gemini2_5FlashLiteLiteral],
};

const Gemini2_5FlashLiteOptions = BaseChatModelOptions;
type Gemini2_5FlashLiteOptionsType = z.infer<typeof Gemini2_5FlashLiteOptions>;

class Gemini2_5FlashLite extends BaseChatModelVertex {
  constructor(options: Gemini2_5FlashLiteOptionsType) {
    super(Gemini2_5FlashLiteSchema, options);
  }
}

export { Gemini2_5FlashLite, Gemini2_5FlashLiteLiteral, Gemini2_5FlashLiteOptions, Gemini2_5FlashLiteSchema, type Gemini2_5FlashLiteOptionsType };
