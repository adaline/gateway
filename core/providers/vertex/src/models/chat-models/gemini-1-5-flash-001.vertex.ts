import { z } from "zod";

import { Gemini1_5Flash001Schema as Google_Gemini1_5Flash001Schema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_5Flash001Literal = "gemini-1.5-flash-001" as const;
const Gemini1_5Flash001Schema = Google_Gemini1_5Flash001Schema;
const Gemini1_5Flash001Options = BaseChatModelOptions;
type Gemini1_5Flash001OptionsType = z.infer<typeof Gemini1_5Flash001Options>;

class Gemini1_5Flash001 extends BaseChatModelVertex {
  constructor(options: Gemini1_5Flash001OptionsType) {
    super(Gemini1_5Flash001Schema, options);
  }
}

export {
  Gemini1_5Flash001,
  Gemini1_5Flash001Options,
  Gemini1_5Flash001Schema,
  Gemini1_5Flash001Literal,
  type Gemini1_5Flash001OptionsType,
};
