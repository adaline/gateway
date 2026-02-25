import { z } from "zod";

import { Gemini2_5FlashLitePreview092025Schema as Google_Gemini2_5FlashLitePreview092025Schema } from "@adaline/google";
import { ChatModelSchemaType } from "@adaline/provider";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5FlashLitePreview092025Literal = "gemini-2.5-flash-lite-preview-09-2025" as const;

const Gemini2_5FlashLitePreview092025Schema: ChatModelSchemaType = {
  ...Google_Gemini2_5FlashLitePreview092025Schema,
  price: pricingData[Gemini2_5FlashLitePreview092025Literal],
};

const Gemini2_5FlashLitePreview092025Options = BaseChatModelOptions;
type Gemini2_5FlashLitePreview092025OptionsType = z.infer<typeof Gemini2_5FlashLitePreview092025Options>;

class Gemini2_5FlashLitePreview092025 extends BaseChatModelVertex {
  constructor(options: Gemini2_5FlashLitePreview092025OptionsType) {
    super(Gemini2_5FlashLitePreview092025Schema, options);
  }
}

export {
  Gemini2_5FlashLitePreview092025,
  Gemini2_5FlashLitePreview092025Literal,
  Gemini2_5FlashLitePreview092025Options,
  Gemini2_5FlashLitePreview092025Schema,
  type Gemini2_5FlashLitePreview092025OptionsType,
};

