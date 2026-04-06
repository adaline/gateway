import { z } from "zod";

import { GPT_5_3_CodexSchema as OpenAI_GPT_5_3_CodexSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_3_CodexLiteral = "gpt-5.3-codex" as const;
const GPT_5_3_CodexSchema = OpenAI_GPT_5_3_CodexSchema;
const GPT_5_3_CodexOptions = BaseChatModelOptions;
type GPT_5_3_CodexOptionsType = z.infer<typeof GPT_5_3_CodexOptions>;

class GPT_5_3_Codex extends BaseChatModelOpenAI {
  constructor(options: GPT_5_3_CodexOptionsType) {
    super(GPT_5_3_CodexSchema, options);
  }
}

export { GPT_5_3_Codex, GPT_5_3_CodexOptions, GPT_5_3_CodexSchema, GPT_5_3_CodexLiteral, type GPT_5_3_CodexOptionsType };
