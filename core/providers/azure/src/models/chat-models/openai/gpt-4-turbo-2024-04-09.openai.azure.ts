import { z } from "zod";

import { GPT_4_Turbo_2024_04_09Schema as OpenAI_GPT_4_Turbo_2024_04_09Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_Turbo_2024_04_09Literal = "gpt-4-turbo-2024-04-09" as const;
const GPT_4_Turbo_2024_04_09Schema = OpenAI_GPT_4_Turbo_2024_04_09Schema;
const GPT_4_Turbo_2024_04_09Options = BaseChatModelOptions;
type GPT_4_Turbo_2024_04_09OptionsType = z.infer<typeof GPT_4_Turbo_2024_04_09Options>;

class GPT_4_Turbo_2024_04_09 extends BaseChatModelOpenAI {
  constructor(options: GPT_4_Turbo_2024_04_09OptionsType) {
    super(GPT_4_Turbo_2024_04_09Schema, options);
  }
}

export {
  GPT_4_Turbo_2024_04_09,
  GPT_4_Turbo_2024_04_09Options,
  GPT_4_Turbo_2024_04_09Schema,
  GPT_4_Turbo_2024_04_09Literal,
  type GPT_4_Turbo_2024_04_09OptionsType,
};
