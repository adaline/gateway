import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelModalities,
  OpenAIChatModelModalitiesEnum,
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
} from "./types";

const ChatGPT_5_2Literal = "chatgpt-5.2";
const ChatGPT_5_2Description =
  "ChatGPT-5.2 model optimized for conversational workloads with tool/function calling support. \
  Training data up to January 2025.";

const ChatGPT_5_2Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: ChatGPT_5_2Literal,
  description: ChatGPT_5_2Description,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData["gpt-5.2"],
});

const ChatGPT_5_2Options = BaseChatModelOptions;
type ChatGPT_5_2OptionsType = z.infer<typeof ChatGPT_5_2Options>;

class ChatGPT_5_2 extends BaseChatModel {
  constructor(options: ChatGPT_5_2OptionsType) {
    super(ChatGPT_5_2Schema, options);
  }
}

export { ChatGPT_5_2, ChatGPT_5_2Literal, ChatGPT_5_2Options, ChatGPT_5_2Schema, type ChatGPT_5_2OptionsType };
