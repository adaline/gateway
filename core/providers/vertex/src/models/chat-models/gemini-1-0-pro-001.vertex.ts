import { z } from "zod";

import { Gemini1_0Pro_001Schema as Google_Gemini1_0Pro_001Schema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_0Pro001Literal = "gemini-1.0-pro-001" as const;
const Gemini1_0Pro001Schema = Google_Gemini1_0Pro_001Schema;
const Gemini1_0Pro001Options = BaseChatModelOptions;
type Gemini1_0Pro001OptionsType = z.infer<typeof Gemini1_0Pro001Options>;

class Gemini1_0Pro001 extends BaseChatModelVertex {
  constructor(options: Gemini1_0Pro001OptionsType) {
    super(Gemini1_0Pro001Schema, options);
  }
}

export { Gemini1_0Pro001, Gemini1_0Pro001Options, Gemini1_0Pro001Schema, Gemini1_0Pro001Literal, type Gemini1_0Pro001OptionsType };
