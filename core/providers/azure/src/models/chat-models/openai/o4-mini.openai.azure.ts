import { z } from "zod";

import { O4_MiniSchema as OpenAI_O4_MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O4_MiniLiteral = "o4-mini" as const;
const O4_MiniSchema = OpenAI_O4_MiniSchema;
const O4_MiniOptions = BaseChatModelOptions;
type O4_MiniOptionsType = z.infer<typeof O4_MiniOptions>;

class O4_Mini extends BaseChatModelOpenAI {
  constructor(options: O4_MiniOptionsType) {
    super(O4_MiniSchema, options);
  }
}

export { O4_Mini, O4_MiniOptions, O4_MiniSchema, O4_MiniLiteral, type O4_MiniOptionsType };
