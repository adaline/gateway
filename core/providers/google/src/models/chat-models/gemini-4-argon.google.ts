import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-4-argon (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// GA 2026-10-13. Standard list price $4/$20 per 1M tokens (stored in pricing.json); promo $2/$10 until 2026-11-30.
// No >200k price tier.
// Text output only. Thinking is controlled by thinking_level only (LOW/MEDIUM/HIGH, default MEDIUM);
// MINIMAL and thinking_budget are not supported. temperature/topP/topK are deprecated on Gemini 3.6+ and omitted.
const Gemini4ArgonLiteral = "gemini-4-argon";
const Gemini4ArgonDescription =
  "Google's efficient frontier reasoning model in the Gemini 4 family, faster with fewer tokens per turn than Carbon \
  on complex coding, agentic, math and science tasks. Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini4ArgonThinkingLevels = ["LOW", "MEDIUM", "HIGH"] as const;

const Gemini4ArgonSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini4ArgonLiteral,
  description: Gemini4ArgonDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4ArgonThinkingLevels, "MEDIUM").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini4ArgonThinkingLevels, "MEDIUM").schema,
  },
  price: pricingData[Gemini4ArgonLiteral],
});

const Gemini4ArgonOptions = BaseChatModelOptions;
type Gemini4ArgonOptionsType = z.infer<typeof Gemini4ArgonOptions>;

class Gemini4Argon extends BaseChatModel {
  constructor(options: Gemini4ArgonOptionsType) {
    super(Gemini4ArgonSchema, options);
  }
}

export { Gemini4Argon, Gemini4ArgonLiteral, Gemini4ArgonOptions, Gemini4ArgonSchema, type Gemini4ArgonOptionsType };
