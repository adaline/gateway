import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-4-hydrogen (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// GA 2026-11-12. $1.50/$7.50 per 1M tokens. No >200k price tier.
// Text output only. Thinking is controlled by thinking_level only (LOW/MEDIUM/HIGH/XHIGH, default HIGH);
// MINIMAL and thinking_budget are not supported. temperature/topP/topK are deprecated on Gemini 3.6+ and omitted.
const Gemini4HydrogenLiteral = "gemini-4-hydrogen";
const Gemini4HydrogenDescription =
  "Google's efficient Gemini 4 model for everyday coding and agentic workflows, balancing capability with speed. \
  Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini4HydrogenThinkingLevels = ["LOW", "MEDIUM", "HIGH", "XHIGH"] as const;

const Gemini4HydrogenSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini4HydrogenLiteral,
  description: Gemini4HydrogenDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4HydrogenThinkingLevels, "HIGH").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4HydrogenThinkingLevels, "HIGH").schema,
  },
  price: pricingData[Gemini4HydrogenLiteral],
});

const Gemini4HydrogenOptions = BaseChatModelOptions;
type Gemini4HydrogenOptionsType = z.infer<typeof Gemini4HydrogenOptions>;

class Gemini4Hydrogen extends BaseChatModel {
  constructor(options: Gemini4HydrogenOptionsType) {
    super(Gemini4HydrogenSchema, options);
  }
}

export { Gemini4Hydrogen, Gemini4HydrogenLiteral, Gemini4HydrogenOptions, Gemini4HydrogenSchema, type Gemini4HydrogenOptionsType };
