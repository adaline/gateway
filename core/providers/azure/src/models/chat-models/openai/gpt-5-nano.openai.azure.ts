import { z } from "zod";

import { GPT_5_NanoSchema as OpenAI_GPT_5_NanoSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_NanoLiteral = "gpt-5-nano" as const;
const GPT_5_NanoSchema = OpenAI_GPT_5_NanoSchema;
const GPT_5_NanoOptions = BaseChatModelOptions;
type GPT_5_NanoOptionsType = z.infer<typeof GPT_5_NanoOptions>;

class GPT_5_Nano extends BaseChatModelOpenAI {
  constructor(options: GPT_5_NanoOptionsType) {
    super(GPT_5_NanoSchema, options);
  }
}

export { GPT_5_Nano, GPT_5_NanoOptions, GPT_5_NanoSchema, GPT_5_NanoLiteral, type GPT_5_NanoOptionsType };
