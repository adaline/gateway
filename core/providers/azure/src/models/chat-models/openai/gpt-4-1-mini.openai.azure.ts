import { z } from "zod";

import { GPT_4_1_MiniSchema as OpenAI_GPT_4_1_MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_1_MiniLiteral = "gpt-4.1-mini" as const;
const GPT_4_1_MiniSchema = OpenAI_GPT_4_1_MiniSchema;
const GPT_4_1_MiniOptions = BaseChatModelOptions;
type GPT_4_1_MiniOptionsType = z.infer<typeof GPT_4_1_MiniOptions>;

class GPT_4_1_Mini extends BaseChatModelOpenAI {
  constructor(options: GPT_4_1_MiniOptionsType) {
    super(GPT_4_1_MiniSchema, options);
  }
}

export { GPT_4_1_Mini, GPT_4_1_MiniOptions, GPT_4_1_MiniSchema, GPT_4_1_MiniLiteral, type GPT_4_1_MiniOptionsType };
