import { z } from "zod";

import { Gemini1_0ProVisionSchema as Google_Gemini1_0ProVisionSchema } from "@adaline/google";

import { BaseChatModelVertex, BaseChatModelOptions } from "./base-chat-model.vertex";

const Gemini1_0ProVisionLiteral = "gemini-1.0-pro-vision" as const;
const Gemini1_0ProVisionSchema = Google_Gemini1_0ProVisionSchema;
const Gemini1_0ProVisionOptions = BaseChatModelOptions;
type Gemini1_0ProVisionOptionsType = z.infer<typeof Gemini1_0ProVisionOptions>;

class Gemini1_0ProVision extends BaseChatModelVertex {
  constructor(options: Gemini1_0ProVisionOptionsType) {
    super(Gemini1_0ProVisionSchema, options);
  }
}

export {
  Gemini1_0ProVision,
  Gemini1_0ProVisionOptions,
  Gemini1_0ProVisionSchema,
  Gemini1_0ProVisionLiteral,
  type Gemini1_0ProVisionOptionsType,
};
