import { z } from "zod";

import { Gemini1_5Pro001Schema as Google_Gemini1_5Pro001Schema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_5Pro001Literal = "gemini-1.5-pro-001" as const;
const Gemini1_5Pro001Schema = Google_Gemini1_5Pro001Schema;
const Gemini1_5Pro001Options = BaseChatModelOptions;
type Gemini1_5Pro001OptionsType = z.infer<typeof Gemini1_5Pro001Options>;

class Gemini1_5Pro001 extends BaseChatModelVertex {
  constructor(options: Gemini1_5Pro001OptionsType) {
    super(Gemini1_5Pro001Schema, options);
  }
}

export { Gemini1_5Pro001, Gemini1_5Pro001Options, Gemini1_5Pro001Schema, Gemini1_5Pro001Literal, type Gemini1_5Pro001OptionsType };
