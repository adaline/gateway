import { z } from "zod";

import { GPT_5_2_CodexSchema as OpenAI_GPT_5_2_CodexSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_2_CodexLiteral = "gpt-5.2-codex" as const;
const GPT_5_2_CodexSchema = OpenAI_GPT_5_2_CodexSchema;
const GPT_5_2_CodexOptions = BaseChatModelOptions;
type GPT_5_2_CodexOptionsType = z.infer<typeof GPT_5_2_CodexOptions>;

class GPT_5_2_Codex extends BaseChatModelOpenAI {
  constructor(options: GPT_5_2_CodexOptionsType) {
    super(GPT_5_2_CodexSchema, options);
  }
}

export { GPT_5_2_Codex, GPT_5_2_CodexOptions, GPT_5_2_CodexSchema, GPT_5_2_CodexLiteral, type GPT_5_2_CodexOptionsType };
