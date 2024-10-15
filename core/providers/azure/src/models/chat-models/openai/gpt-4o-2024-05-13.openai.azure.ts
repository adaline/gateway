import { z } from "zod";

import { GPT_4o_2024_05_13Schema as OpenAI_GPT_4o_2024_05_13Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4o_2024_05_13Literal = "gpt-4o-2024-05-13" as const;
const GPT_4o_2024_05_13Schema = OpenAI_GPT_4o_2024_05_13Schema;
const GPT_4o_2024_05_13Options = BaseChatModelOptions;
type GPT_4o_2024_05_13OptionsType = z.infer<typeof GPT_4o_2024_05_13Options>;

class GPT_4o_2024_05_13 extends BaseChatModelOpenAI {
  constructor(options: GPT_4o_2024_05_13OptionsType) {
    super(GPT_4o_2024_05_13Schema, options);
  }
}

export {
  GPT_4o_2024_05_13,
  GPT_4o_2024_05_13Options,
  GPT_4o_2024_05_13Schema,
  GPT_4o_2024_05_13Literal,
  type GPT_4o_2024_05_13OptionsType,
};
