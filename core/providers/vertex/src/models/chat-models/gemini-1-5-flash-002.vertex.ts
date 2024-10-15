import { z } from "zod";

import { Gemini1_5Flash002Schema as Google_Gemini1_5Flash002Schema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_5Flash002Literal = "gemini-1.5-flash-002" as const;
const Gemini1_5Flash002Schema = Google_Gemini1_5Flash002Schema;
const Gemini1_5Flash002Options = BaseChatModelOptions;
type Gemini1_5Flash002OptionsType = z.infer<typeof Gemini1_5Flash002Options>;

class Gemini1_5Flash002 extends BaseChatModelVertex {
  constructor(options: Gemini1_5Flash002OptionsType) {
    super(Gemini1_5Flash002Schema, options);
  }
}

export {
  Gemini1_5Flash002,
  Gemini1_5Flash002Options,
  Gemini1_5Flash002Schema,
  Gemini1_5Flash002Literal,
  type Gemini1_5Flash002OptionsType,
};
