import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5FlashLiteral = "gemini-2.5-flash";
const Gemini2_5FlashDescription =
  "Google's Gemini 2.5 Flash model for enhanced thinking, reasoning, multimodal understanding, and advanced coding.";

const Gemini2_5FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5FlashLiteral,
  description: Gemini2_5FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_5FlashLiteral],
});

const Gemini2_5FlashOptions = BaseChatModelOptions;
type Gemini2_5FlashOptionsType = z.infer<typeof Gemini2_5FlashOptions>;

class Gemini2_5Flash extends BaseChatModel {
  constructor(options: Gemini2_5FlashOptionsType) {
    super(Gemini2_5FlashSchema, options);
  }
}

export { Gemini2_5Flash, Gemini2_5FlashLiteral, Gemini2_5FlashOptions, Gemini2_5FlashSchema, type Gemini2_5FlashOptionsType };
