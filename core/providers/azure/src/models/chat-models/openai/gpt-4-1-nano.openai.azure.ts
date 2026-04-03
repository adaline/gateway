import { z } from "zod";

import { GPT_4_1_NanoSchema as OpenAI_GPT_4_1_NanoSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_1_NanoLiteral = "gpt-4.1-nano" as const;
const GPT_4_1_NanoSchema = OpenAI_GPT_4_1_NanoSchema;
const GPT_4_1_NanoOptions = BaseChatModelOptions;
type GPT_4_1_NanoOptionsType = z.infer<typeof GPT_4_1_NanoOptions>;

class GPT_4_1_Nano extends BaseChatModelOpenAI {
  constructor(options: GPT_4_1_NanoOptionsType) {
    super(GPT_4_1_NanoSchema, options);
  }
}

export { GPT_4_1_Nano, GPT_4_1_NanoOptions, GPT_4_1_NanoSchema, GPT_4_1_NanoLiteral, type GPT_4_1_NanoOptionsType };
