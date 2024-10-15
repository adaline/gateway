import { z } from "zod";

import { GPT_4o_Mini_2024_07_18Schema as OpenAI_GPT_4o_Mini_2024_07_18Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4o_Mini_2024_07_18Literal = "gpt-4o-mini-2024-07-18" as const;
const GPT_4o_Mini_2024_07_18Schema = OpenAI_GPT_4o_Mini_2024_07_18Schema;
const GPT_4o_Mini_2024_07_18Options = BaseChatModelOptions;
type GPT_4o_Mini_2024_07_18OptionsType = z.infer<typeof GPT_4o_Mini_2024_07_18Options>;

class GPT_4o_Mini_2024_07_18 extends BaseChatModelOpenAI {
  constructor(options: GPT_4o_Mini_2024_07_18OptionsType) {
    super(GPT_4o_Mini_2024_07_18Schema, options);
  }
}

export {
  GPT_4o_Mini_2024_07_18,
  GPT_4o_Mini_2024_07_18Options,
  GPT_4o_Mini_2024_07_18Schema,
  GPT_4o_Mini_2024_07_18Literal,
  type GPT_4o_Mini_2024_07_18OptionsType,
};
