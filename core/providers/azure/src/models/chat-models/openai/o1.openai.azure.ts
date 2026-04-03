import { z } from "zod";

import { O1Schema as OpenAI_O1Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O1Literal = "o1" as const;
const O1Schema = OpenAI_O1Schema;
const O1Options = BaseChatModelOptions;
type O1OptionsType = z.infer<typeof O1Options>;

class O1 extends BaseChatModelOpenAI {
  constructor(options: O1OptionsType) {
    super(O1Schema, options);
  }
}

export { O1, O1Options, O1Schema, O1Literal, type O1OptionsType };
