import { z } from "zod";

import { GPT_5_2_ChatLatestSchema as OpenAI_GPT_5_2_ChatLatestSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_5_2_ChatLatestLiteral = "gpt-5.2-chat-latest" as const;
const GPT_5_2_ChatLatestSchema = OpenAI_GPT_5_2_ChatLatestSchema;
const GPT_5_2_ChatLatestOptions = BaseChatModelOptions;
type GPT_5_2_ChatLatestOptionsType = z.infer<typeof GPT_5_2_ChatLatestOptions>;

class GPT_5_2_ChatLatest extends BaseChatModelOpenAI {
  constructor(options: GPT_5_2_ChatLatestOptionsType) {
    super(GPT_5_2_ChatLatestSchema, options);
  }
}

export {
  GPT_5_2_ChatLatest,
  GPT_5_2_ChatLatestOptions,
  GPT_5_2_ChatLatestSchema,
  GPT_5_2_ChatLatestLiteral,
  type GPT_5_2_ChatLatestOptionsType,
};
