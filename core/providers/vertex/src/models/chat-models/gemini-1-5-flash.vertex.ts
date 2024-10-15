import { z } from "zod";

import { Gemini1_5FlashSchema as Google_Gemini1_5FlashSchema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_5FlashLiteral = "gemini-1.5-flash" as const;
const Gemini1_5FlashSchema = Google_Gemini1_5FlashSchema;
const Gemini1_5FlashOptions = BaseChatModelOptions;
type Gemini1_5FlashOptionsType = z.infer<typeof Gemini1_5FlashOptions>;

class Gemini1_5Flash extends BaseChatModelVertex {
  constructor(options: Gemini1_5FlashOptionsType) {
    super(Gemini1_5FlashSchema, options);
  }
}

export { Gemini1_5Flash, Gemini1_5FlashOptions, Gemini1_5FlashSchema, Gemini1_5FlashLiteral, type Gemini1_5FlashOptionsType };
