import { z } from "zod";

import { O1_2024_12_17Schema as OpenAI_O1_2024_12_17Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O1_2024_12_17Literal = "o1-2024-12-17" as const;
const O1_2024_12_17Schema = OpenAI_O1_2024_12_17Schema;
const O1_2024_12_17Options = BaseChatModelOptions;
type O1_2024_12_17OptionsType = z.infer<typeof O1_2024_12_17Options>;

class O1_2024_12_17 extends BaseChatModelOpenAI {
  constructor(options: O1_2024_12_17OptionsType) {
    super(O1_2024_12_17Schema, options);
  }
}

export { O1_2024_12_17, O1_2024_12_17Options, O1_2024_12_17Schema, O1_2024_12_17Literal, type O1_2024_12_17OptionsType };
