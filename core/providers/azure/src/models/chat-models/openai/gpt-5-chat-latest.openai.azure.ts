import { z } from "zod";

import { GPT_5_ChatLatestSchema as OpenAI_GPT_5_ChatLatestSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_ChatLatestLiteral = "gpt-5-chat-latest" as const;
const GPT_5_ChatLatestSchema = OpenAI_GPT_5_ChatLatestSchema;
const GPT_5_ChatLatestOptions = BaseChatModelOptions;
type GPT_5_ChatLatestOptionsType = z.infer<typeof GPT_5_ChatLatestOptions>;

class GPT_5_ChatLatest extends BaseChatModelOpenAI {
  constructor(options: GPT_5_ChatLatestOptionsType) {
    super(GPT_5_ChatLatestSchema, options);
  }
}

export { GPT_5_ChatLatest, GPT_5_ChatLatestOptions, GPT_5_ChatLatestSchema, GPT_5_ChatLatestLiteral, type GPT_5_ChatLatestOptionsType };
