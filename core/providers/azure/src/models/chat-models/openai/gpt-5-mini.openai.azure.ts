import { z } from "zod";

import { GPT_5_MiniSchema as OpenAI_GPT_5_MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_MiniLiteral = "gpt-5-mini" as const;
const GPT_5_MiniSchema = OpenAI_GPT_5_MiniSchema;
const GPT_5_MiniOptions = BaseChatModelOptions;
type GPT_5_MiniOptionsType = z.infer<typeof GPT_5_MiniOptions>;

class GPT_5_Mini extends BaseChatModelOpenAI {
  constructor(options: GPT_5_MiniOptionsType) {
    super(GPT_5_MiniSchema, options);
  }
}

export { GPT_5_Mini, GPT_5_MiniOptions, GPT_5_MiniSchema, GPT_5_MiniLiteral, type GPT_5_MiniOptionsType };
