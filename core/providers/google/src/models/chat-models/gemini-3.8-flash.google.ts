import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://aistudio.google.com/docs/models/gemini-3.8-flash (retrieved 2026-11-20)
// Specs reference: https://aistudio.google.com/docs/pricing (retrieved 2026-11-20)
// GA 2026-09-02. Standard list price $1.50/$7.50 per 1M tokens (stored in pricing.json; applies from 2027-01-01);
// intro price $0.75/$3.75 until 2026-12-31. No >200k price tier.
// Text output only. Thinking is controlled by thinking_level only (LOW/MEDIUM/HIGH, default MEDIUM);
// MINIMAL and thinking_budget are not supported. temperature/topP/topK are deprecated on Gemini 3.6+ and omitted.
const Gemini3_8FlashLiteral = "gemini-3.8-flash";
const Gemini3_8FlashDescription =
  "Google's most capable Flash model for long-running software engineering, autonomous agents, and complex enterprise workflows \
  at Flash-level speed and cost. Supports Text, Image, Video, Audio, and PDF inputs.";

const Gemini3_8FlashThinkingLevels = ["LOW", "MEDIUM", "HIGH"] as const;

const Gemini3_8FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_8FlashLiteral,
  description: Gemini3_8FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini3_8FlashThinkingLevels, "MEDIUM").def,
    schema: GoogleChatModelConfigs.thinkingLevel(65536, 4, Gemini3_8FlashThinkingLevels, "MEDIUM").schema,
  },
  price: pricingData[Gemini3_8FlashLiteral],
});

const Gemini3_8FlashOptions = BaseChatModelOptions;
type Gemini3_8FlashOptionsType = z.infer<typeof Gemini3_8FlashOptions>;

class Gemini3_8Flash extends BaseChatModel {
  constructor(options: Gemini3_8FlashOptionsType) {
    super(Gemini3_8FlashSchema, options);
  }
}

export { Gemini3_8Flash, Gemini3_8FlashLiteral, Gemini3_8FlashOptions, Gemini3_8FlashSchema, type Gemini3_8FlashOptionsType };
