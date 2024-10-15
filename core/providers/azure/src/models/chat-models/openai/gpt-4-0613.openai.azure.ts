import { z } from "zod";

import { GPT_4_0613Schema as OpenAI_GPT_4_0613Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_0613Literal = "gpt-4-0613" as const;
const GPT_4_0613Schema = OpenAI_GPT_4_0613Schema;
const GPT_4_0613Options = BaseChatModelOptions;
type GPT_4_0613OptionsType = z.infer<typeof GPT_4_0613Options>;

class GPT_4_0613 extends BaseChatModelOpenAI {
  constructor(options: GPT_4_0613OptionsType) {
    super(GPT_4_0613Schema, options);
  }
}

export { GPT_4_0613, GPT_4_0613Options, GPT_4_0613Schema, GPT_4_0613Literal, type GPT_4_0613OptionsType };
