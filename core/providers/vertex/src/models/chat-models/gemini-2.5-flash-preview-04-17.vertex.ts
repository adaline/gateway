import { z } from "zod";

import { Gemini2_5FlashPreview0417Schema as Google_Gemini2_5FlashPreview0417Schema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5FlashPreview0417Literal = "gemini-2.5-flash-preview-04-17" as const;
const Gemini2_5FlashPreview0417Schema = {
  ...Google_Gemini2_5FlashPreview0417Schema,
  price: pricingData[Gemini2_5FlashPreview0417Literal],
} as const;
const Gemini2_5FlashPreview0417Options = BaseChatModelOptions;
type Gemini2_5FlashPreview0417OptionsType = z.infer<typeof Gemini2_5FlashPreview0417Options>;

class Gemini2_5FlashPreview0417 extends BaseChatModelVertex {
  constructor(options: Gemini2_5FlashPreview0417OptionsType) {
    super(Gemini2_5FlashPreview0417Schema, options);
  }
}

export {
  Gemini2_5FlashPreview0417,
  Gemini2_5FlashPreview0417Literal,
  Gemini2_5FlashPreview0417Options,
  Gemini2_5FlashPreview0417Schema,
  type Gemini2_5FlashPreview0417OptionsType,
};
