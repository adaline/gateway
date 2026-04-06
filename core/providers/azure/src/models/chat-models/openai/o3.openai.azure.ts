import { z } from "zod";

import { O3Schema as OpenAI_O3Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O3Literal = "o3" as const;
const O3Schema = OpenAI_O3Schema;
const O3Options = BaseChatModelOptions;
type O3OptionsType = z.infer<typeof O3Options>;

class O3 extends BaseChatModelOpenAI {
  constructor(options: O3OptionsType) {
    super(O3Schema, options);
  }
}

export { O3, O3Options, O3Schema, O3Literal, type O3OptionsType };
