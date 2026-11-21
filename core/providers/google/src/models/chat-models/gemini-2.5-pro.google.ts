import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/changelog (2026-11-02 entry, retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/deprecations (retrieved 2026-11-20)
const Gemini2_5ProLiteral = "gemini-2.5-pro";
const Gemini2_5ProDescription =
  "Google's Gemini 2.5 Pro model for enhanced thinking, reasoning, multimodal understanding, and advanced coding. " +
  "Deprecated; from 2026-12-01 requests route to gemini-3.8-flash, billed at that model's rates.";

const Gemini2_5ProSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5ProLiteral,
  description: Gemini2_5ProDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini2_5ProLiteral],
});

const Gemini2_5ProOptions = BaseChatModelOptions;
type Gemini2_5ProOptionsType = z.infer<typeof Gemini2_5ProOptions>;

class Gemini2_5Pro extends BaseChatModel {
  constructor(options: Gemini2_5ProOptionsType) {
    super(Gemini2_5ProSchema, options);
  }
}

export { Gemini2_5Pro, Gemini2_5ProLiteral, Gemini2_5ProOptions, Gemini2_5ProSchema, type Gemini2_5ProOptionsType };
