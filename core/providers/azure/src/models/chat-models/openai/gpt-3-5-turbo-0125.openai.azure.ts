import { z } from "zod";

import { GPT_3_5_Turbo_0125Schema as OpenAI_GPT_3_5_Turbo_0125Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_3_5_Turbo_0125Literal = "gpt-3-5-turbo-0125" as const;
const GPT_3_5_Turbo_0125Schema = OpenAI_GPT_3_5_Turbo_0125Schema;
const GPT_3_5_Turbo_0125Options = BaseChatModelOptions;
type GPT_3_5_Turbo_0125OptionsType = z.infer<typeof GPT_3_5_Turbo_0125Options>;

class GPT_3_5_Turbo_0125 extends BaseChatModelOpenAI {
  constructor(options: GPT_3_5_Turbo_0125OptionsType) {
    super(GPT_3_5_Turbo_0125Schema, options);
  }
}

export {
  GPT_3_5_Turbo_0125,
  GPT_3_5_Turbo_0125Options,
  GPT_3_5_Turbo_0125Schema,
  GPT_3_5_Turbo_0125Literal,
  type GPT_3_5_Turbo_0125OptionsType,
};
