import { z } from "zod";

import { ChatGPT_4o_LatestSchema as OpenAI_ChatGPT_4o_LatestSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const ChatGPT_4o_LatestLiteral = "chatgpt-4o-latest" as const;
const ChatGPT_4o_LatestSchema = OpenAI_ChatGPT_4o_LatestSchema;
const ChatGPT_4o_LatestOptions = BaseChatModelOptions;
type ChatGPT_4o_LatestOptionsType = z.infer<typeof ChatGPT_4o_LatestOptions>;

class ChatGPT_4o_Latest extends BaseChatModelOpenAI {
  constructor(options: ChatGPT_4o_LatestOptionsType) {
    super(ChatGPT_4o_LatestSchema, options);
  }
}

export {
  ChatGPT_4o_Latest,
  ChatGPT_4o_LatestOptions,
  ChatGPT_4o_LatestSchema,
  ChatGPT_4o_LatestLiteral,
  type ChatGPT_4o_LatestOptionsType,
};
