import { z } from "zod";

import { GPT_4_Turbo_PreviewSchema as OpenAI_GPT_4_Turbo_PreviewSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_Turbo_PreviewLiteral = "gpt-4-turbo-preview" as const;
const GPT_4_Turbo_PreviewSchema = OpenAI_GPT_4_Turbo_PreviewSchema;
const GPT_4_Turbo_PreviewOptions = BaseChatModelOptions;
type GPT_4_Turbo_PreviewOptionsType = z.infer<typeof GPT_4_Turbo_PreviewOptions>;

class GPT_4_Turbo_Preview extends BaseChatModelOpenAI {
  constructor(options: GPT_4_Turbo_PreviewOptionsType) {
    super(GPT_4_Turbo_PreviewSchema, options);
  }
}

export {
  GPT_4_Turbo_Preview,
  GPT_4_Turbo_PreviewOptions,
  GPT_4_Turbo_PreviewSchema,
  GPT_4_Turbo_PreviewLiteral,
  type GPT_4_Turbo_PreviewOptionsType,
};
