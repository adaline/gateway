import { z } from "zod";

import { Gemini1_0ProSchema as Google_Gemini1_0ProSchema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_0ProLiteral = "gemini-1.0-pro" as const;
const Gemini1_0ProSchema = Google_Gemini1_0ProSchema;
const Gemini1_0ProOptions = BaseChatModelOptions;
type Gemini1_0ProOptionsType = z.infer<typeof Gemini1_0ProOptions>;

class Gemini1_0Pro extends BaseChatModelVertex {
  constructor(options: Gemini1_0ProOptionsType) {
    super(Gemini1_0ProSchema, options);
  }
}

export { Gemini1_0Pro, Gemini1_0ProOptions, Gemini1_0ProSchema, Gemini1_0ProLiteral, type Gemini1_0ProOptionsType };
