import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral } from "@adaline/types";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://platform.openai.com/docs/models/chatgpt-4o-latest (retrieved 2026-02-25)
const ChatGPT_4o_LatestLiteral = "chatgpt-4o-latest";
const ChatGPT_4o_LatestDescription =
  "Latest ChatGPT-4o chat model optimized for conversational quality. Does not support function calling or structured outputs.";

const ChatGPT_4o_LatestModalities = [TextModalityLiteral, ImageModalityLiteral];
const ChatGPT_4o_LatestModalitiesEnum = z.enum([TextModalityLiteral, ImageModalityLiteral]);

const ChatGPT_4o_LatestSchema = ChatModelSchema(OpenAIChatModelRoles, ChatGPT_4o_LatestModalitiesEnum).parse({
  name: ChatGPT_4o_LatestLiteral,
  description: ChatGPT_4o_LatestDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: ChatGPT_4o_LatestModalities,
  config: {
    def: OpenAIChatModelConfigs.responseFormat(16384, 4).def,
    schema: OpenAIChatModelConfigs.responseFormat(16384, 4).schema,
  },
  price: pricingData[ChatGPT_4o_LatestLiteral],
});

const ChatGPT_4o_LatestOptions = BaseChatModelOptions;
type ChatGPT_4o_LatestOptionsType = z.infer<typeof ChatGPT_4o_LatestOptions>;

class ChatGPT_4o_Latest extends BaseChatModel {
  constructor(options: ChatGPT_4o_LatestOptionsType) {
    super(ChatGPT_4o_LatestSchema, options);
  }
}

export {
  ChatGPT_4o_Latest,
  ChatGPT_4o_LatestLiteral,
  ChatGPT_4o_LatestOptions,
  ChatGPT_4o_LatestSchema,
  type ChatGPT_4o_LatestOptionsType,
};

