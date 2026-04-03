import { z } from "zod";

import { GPT_4_1Schema as OpenAI_GPT_4_1Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_1Literal = "gpt-4.1" as const;
const GPT_4_1Schema = OpenAI_GPT_4_1Schema;
const GPT_4_1Options = BaseChatModelOptions;
type GPT_4_1OptionsType = z.infer<typeof GPT_4_1Options>;

class GPT_4_1 extends BaseChatModelOpenAI {
  constructor(options: GPT_4_1OptionsType) {
    super(GPT_4_1Schema, options);
  }
}

export { GPT_4_1, GPT_4_1Options, GPT_4_1Schema, GPT_4_1Literal, type GPT_4_1OptionsType };
