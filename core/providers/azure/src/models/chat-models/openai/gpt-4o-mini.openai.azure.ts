import { z } from "zod";

import { GPT_4o_MiniSchema as OpenAI_GPT_4o_MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4o_MiniLiteral = "gpt-4o-mini" as const;
const GPT_4o_MiniSchema = OpenAI_GPT_4o_MiniSchema;
const GPT_4o_MiniOptions = BaseChatModelOptions;
type GPT_4o_MiniOptionsType = z.infer<typeof GPT_4o_MiniOptions>;

class GPT_4o_Mini extends BaseChatModelOpenAI {
  constructor(options: GPT_4o_MiniOptionsType) {
    super(GPT_4o_MiniSchema, options);
  }
}

export { GPT_4o_Mini, GPT_4o_MiniOptions, GPT_4o_MiniSchema, GPT_4o_MiniLiteral, type GPT_4o_MiniOptionsType };
