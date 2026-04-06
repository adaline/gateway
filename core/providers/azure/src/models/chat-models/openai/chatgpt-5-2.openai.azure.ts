import { z } from "zod";

import { ChatGPT_5_2Schema as OpenAI_ChatGPT_5_2Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const ChatGPT_5_2Literal = "chatgpt-5.2" as const;
const ChatGPT_5_2Schema = OpenAI_ChatGPT_5_2Schema;
const ChatGPT_5_2Options = BaseChatModelOptions;
type ChatGPT_5_2OptionsType = z.infer<typeof ChatGPT_5_2Options>;

class ChatGPT_5_2 extends BaseChatModelOpenAI {
  constructor(options: ChatGPT_5_2OptionsType) {
    super(ChatGPT_5_2Schema, options);
  }
}

export { ChatGPT_5_2, ChatGPT_5_2Options, ChatGPT_5_2Schema, ChatGPT_5_2Literal, type ChatGPT_5_2OptionsType };
