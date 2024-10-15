import { z } from "zod";

import { GPT_4Schema as OpenAI_GPT_4Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4Literal = "gpt-4" as const;
const GPT_4Schema = OpenAI_GPT_4Schema;
const GPT_4Options = BaseChatModelOptions;
type GPT_4OptionsType = z.infer<typeof GPT_4Options>;

class GPT_4 extends BaseChatModelOpenAI {
  constructor(options: GPT_4OptionsType) {
    super(GPT_4Schema, options);
  }
}

export { GPT_4, GPT_4Options, GPT_4Schema, GPT_4Literal, type GPT_4OptionsType };
