import { z } from "zod";

import { GPT_4_TurboSchema as OpenAI_GPT_4_TurboSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_4_TurboLiteral = "gpt-4-turbo" as const;
const GPT_4_TurboSchema = OpenAI_GPT_4_TurboSchema;
const GPT_4_TurboOptions = BaseChatModelOptions;
type GPT_4_TurboOptionsType = z.infer<typeof GPT_4_TurboOptions>;

class GPT_4_Turbo extends BaseChatModelOpenAI {
  constructor(options: GPT_4_TurboOptionsType) {
    super(GPT_4_TurboSchema, options);
  }
}

export { GPT_4_Turbo, GPT_4_TurboOptions, GPT_4_TurboSchema, GPT_4_TurboLiteral, type GPT_4_TurboOptionsType };
