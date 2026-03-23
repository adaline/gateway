import { z } from "zod";

import { O3MiniSchema as OpenAI_O3MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O3MiniLiteral = "o3-mini" as const;
const O3MiniSchema = OpenAI_O3MiniSchema;
const O3MiniOptions = BaseChatModelOptions;
type O3MiniOptionsType = z.infer<typeof O3MiniOptions>;

class O3Mini extends BaseChatModelOpenAI {
  constructor(options: O3MiniOptionsType) {
    super(O3MiniSchema, options);
  }
}

export { O3Mini, O3MiniOptions, O3MiniSchema, O3MiniLiteral, type O3MiniOptionsType };
