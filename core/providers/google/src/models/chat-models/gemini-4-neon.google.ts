import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-4-neon (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// GA 2026-11-18. $3/$15 per 1M tokens. No >200k price tier.
// Text output only. Thinking is controlled by thinking_level only (LOW/MEDIUM/HIGH/XHIGH, default HIGH);
// MINIMAL and thinking_budget are not supported. temperature/topP/topK are deprecated on Gemini 3.6+ and omitted.
const Gemini4NeonLiteral = "gemini-4-neon";
const Gemini4NeonDescription =
  "Google's Gemini 4 Neon frontier model for fast end-to-end completion of complex software engineering, knowledge work, \
  and science tasks. Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini4NeonThinkingLevels = ["LOW", "MEDIUM", "HIGH", "XHIGH"] as const;

const Gemini4NeonSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini4NeonLiteral,
  description: Gemini4NeonDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4NeonThinkingLevels, "HIGH").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4NeonThinkingLevels, "HIGH").schema,
  },
  price: pricingData[Gemini4NeonLiteral],
});

const Gemini4NeonOptions = BaseChatModelOptions;
type Gemini4NeonOptionsType = z.infer<typeof Gemini4NeonOptions>;

class Gemini4Neon extends BaseChatModel {
  constructor(options: Gemini4NeonOptionsType) {
    super(Gemini4NeonSchema, options);
  }
}

export { Gemini4Neon, Gemini4NeonLiteral, Gemini4NeonOptions, Gemini4NeonSchema, type Gemini4NeonOptionsType };
