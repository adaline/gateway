import { z } from "zod";

import { GPT_4o_2024_08_06Schema as OpenAI_GPT_4o_2024_08_06Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4o_2024_08_06Literal = "gpt-4o-2024-08-06" as const;
const GPT_4o_2024_08_06Schema = OpenAI_GPT_4o_2024_08_06Schema;
const GPT_4o_2024_08_06Options = BaseChatModelOptions;
type GPT_4o_2024_08_06OptionsType = z.infer<typeof GPT_4o_2024_08_06Options>;

class GPT_4o_2024_08_06 extends BaseChatModelOpenAI {
  constructor(options: GPT_4o_2024_08_06OptionsType) {
    super(GPT_4o_2024_08_06Schema, options);
  }
}

export {
  GPT_4o_2024_08_06,
  GPT_4o_2024_08_06Options,
  GPT_4o_2024_08_06Schema,
  GPT_4o_2024_08_06Literal,
  type GPT_4o_2024_08_06OptionsType,
};
