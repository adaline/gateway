import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-4-carbon (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// GA 2026-11-10. Standard list price $4/$20 per 1M tokens (stored in pricing.json); intro promo $2/$10 until 2026-11-30.
// No >200k price tier. Cached-input rates are not representable in pricing.json (see pricing page).
// Text output only. Thinking is controlled by thinking_level only (LOW/MEDIUM/HIGH, default MEDIUM);
// MINIMAL and thinking_budget are not supported. temperature/topP/topK are deprecated on Gemini 3.6+ and omitted.
const Gemini4CarbonLiteral = "gemini-4-carbon";
const Gemini4CarbonDescription =
  "Google's most capable Gemini 4 reasoning model for complex software engineering, math and science, high factual accuracy, \
  and autonomous multi-step agents. Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini4CarbonThinkingLevels = ["LOW", "MEDIUM", "HIGH"] as const;

const Gemini4CarbonSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini4CarbonLiteral,
  description: Gemini4CarbonDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4CarbonThinkingLevels, "MEDIUM").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4CarbonThinkingLevels, "MEDIUM").schema,
  },
  price: pricingData[Gemini4CarbonLiteral],
});

const Gemini4CarbonOptions = BaseChatModelOptions;
type Gemini4CarbonOptionsType = z.infer<typeof Gemini4CarbonOptions>;

class Gemini4Carbon extends BaseChatModel {
  constructor(options: Gemini4CarbonOptionsType) {
    super(Gemini4CarbonSchema, options);
  }
}

export { Gemini4Carbon, Gemini4CarbonLiteral, Gemini4CarbonOptions, Gemini4CarbonSchema, type Gemini4CarbonOptionsType };
