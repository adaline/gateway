import { z } from "zod";

import { GPT_5_1Schema as OpenAI_GPT_5_1Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_1Literal = "gpt-5.1" as const;
const GPT_5_1Schema = OpenAI_GPT_5_1Schema;
const GPT_5_1Options = BaseChatModelOptions;
type GPT_5_1OptionsType = z.infer<typeof GPT_5_1Options>;

class GPT_5_1 extends BaseChatModelOpenAI {
  constructor(options: GPT_5_1OptionsType) {
    super(GPT_5_1Schema, options);
  }
}

export { GPT_5_1, GPT_5_1Options, GPT_5_1Schema, GPT_5_1Literal, type GPT_5_1OptionsType };
