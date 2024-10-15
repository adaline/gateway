import { z } from "zod";

import { GPT_4_1106_PreviewSchema as OpenAI_GPT_4_1106_PreviewSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_1106_PreviewLiteral = "gpt-4-1106-preview" as const;
const GPT_4_1106_PreviewSchema = OpenAI_GPT_4_1106_PreviewSchema;
const GPT_4_1106_PreviewOptions = BaseChatModelOptions;
type GPT_4_1106_PreviewOptionsType = z.infer<typeof GPT_4_1106_PreviewOptions>;

class GPT_4_1106_Preview extends BaseChatModelOpenAI {
  constructor(options: GPT_4_1106_PreviewOptionsType) {
    super(GPT_4_1106_PreviewSchema, options);
  }
}

export {
  GPT_4_1106_Preview,
  GPT_4_1106_PreviewOptions,
  GPT_4_1106_PreviewSchema,
  GPT_4_1106_PreviewLiteral,
  type GPT_4_1106_PreviewOptionsType,
};
