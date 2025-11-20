import { z } from "zod";

import { Gemini2_5ProPreview0325Schema as Google_Gemini2_5ProPreview0325Schema } from "@adaline/google";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_5ProPreview0325Literal = "gemini-2.5-pro-preview-03-25" as const;
const Gemini2_5ProPreview0325Schema = {
  ...Google_Gemini2_5ProPreview0325Schema,
  price: pricingData[Gemini2_5ProPreview0325Literal],
} as const;
const Gemini2_5ProPreview0325Options = BaseChatModelOptions;
type Gemini2_5ProPreview0325OptionsType = z.infer<typeof Gemini2_5ProPreview0325Options>;

class Gemini2_5ProPreview0325 extends BaseChatModelVertex {
  constructor(options: Gemini2_5ProPreview0325OptionsType) {
    super(Gemini2_5ProPreview0325Schema, options);
  }
}

export {
  Gemini2_5ProPreview0325,
  Gemini2_5ProPreview0325Literal,
  Gemini2_5ProPreview0325Options,
  Gemini2_5ProPreview0325Schema,
  type Gemini2_5ProPreview0325OptionsType,
};
