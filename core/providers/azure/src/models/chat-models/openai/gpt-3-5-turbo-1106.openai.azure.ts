import { z } from "zod";

import { GPT_3_5_Turbo_1106Schema as OpenAI_GPT_3_5_Turbo_1106Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_3_5_Turbo_1106Literal = "gpt-3-5-turbo-1106" as const;
const GPT_3_5_Turbo_1106Schema = OpenAI_GPT_3_5_Turbo_1106Schema;
const GPT_3_5_Turbo_1106Options = BaseChatModelOptions;
type GPT_3_5_Turbo_1106OptionsType = z.infer<typeof GPT_3_5_Turbo_1106Options>;

class GPT_3_5_Turbo_1106 extends BaseChatModelOpenAI {
  constructor(options: GPT_3_5_Turbo_1106OptionsType) {
    super(GPT_3_5_Turbo_1106Schema, options);
  }
}

export {
  GPT_3_5_Turbo_1106,
  GPT_3_5_Turbo_1106Options,
  GPT_3_5_Turbo_1106Schema,
  GPT_3_5_Turbo_1106Literal,
  type GPT_3_5_Turbo_1106OptionsType,
};
