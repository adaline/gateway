import { z } from "zod";

import { GPT_4_0125_PreviewSchema as OpenAI_GPT_4_0125_PreviewSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_0125_PreviewLiteral = "gpt-4-0125-preview" as const;
const GPT_4_0125_PreviewSchema = OpenAI_GPT_4_0125_PreviewSchema;
const GPT_4_0125_PreviewOptions = BaseChatModelOptions;
type GPT_4_0125_PreviewOptionsType = z.infer<typeof GPT_4_0125_PreviewOptions>;

class GPT_4_0125_Preview extends BaseChatModelOpenAI {
  constructor(options: GPT_4_0125_PreviewOptionsType) {
    super(GPT_4_0125_PreviewSchema, options);
  }
}

export {
  GPT_4_0125_Preview,
  GPT_4_0125_PreviewOptions,
  GPT_4_0125_PreviewSchema,
  GPT_4_0125_PreviewLiteral,
  type GPT_4_0125_PreviewOptionsType,
};
