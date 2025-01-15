import { z } from "zod";

import { Gemini2_0FlashExpSchema as Google_Gemini2_0FlashExpSchema } from "@adaline/google";

import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

const Gemini2_0FlashExpLiteral = "gemini-2.0-flash-exp" as const;
const Gemini2_0FlashExpSchema = Google_Gemini2_0FlashExpSchema;
const Gemini2_0FlashExpOptions = BaseChatModelOptions;
type Gemini2_0FlashExpOptionsType = z.infer<typeof Gemini2_0FlashExpOptions>;

class Gemini2_0FlashExp extends BaseChatModelVertex {
  constructor(options: Gemini2_0FlashExpOptionsType) {
    super(Gemini2_0FlashExpSchema, options);
  }
}

export {
  Gemini2_0FlashExp,
  Gemini2_0FlashExpLiteral,
  Gemini2_0FlashExpOptions,
  Gemini2_0FlashExpSchema,
  type Gemini2_0FlashExpOptionsType,
};
